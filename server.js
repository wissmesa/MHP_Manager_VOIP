import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import twilio from "twilio";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Log current working directory and paths for debugging
console.log('📁 Current working directory:', process.cwd());
console.log('📁 __dirname:', __dirname);
const publicPath = path.join(__dirname, "public");
console.log('📁 Public path:', publicPath);

// Verify public directory exists
import { existsSync, readdirSync } from "fs";
if (!existsSync(publicPath)) {
  console.error('❌ ERROR: Public directory does not exist at:', publicPath);
  console.error('📁 Available files in __dirname:');
  try {
    const files = readdirSync(__dirname);
    console.error(files);
  } catch (err) {
    console.error('Could not read directory:', err);
  }
  process.exit(1);
}

const app = express();
const { AccessToken } = twilio.jwt;
const { VoiceGrant } = AccessToken;

app.use(cors());
app.use(express.json());
// Configuration to receive data from Twilio (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`\n📥 ${req.method} ${req.path}`);
  if (req.method === 'POST') {
    console.log('Body:', req.body);
  }
  next();
});

app.use(express.static(path.join(__dirname, "public")));

// Health check endpoint for Railway
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Endpoint to generate Access Token
app.get("/token", (req, res) => {
  const identity = req.query.identity || "agent123";
  
  console.log(`\n🔑 Token request received for identity: ${identity}`);
  console.log(`📋 Query params:`, req.query);

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_API_KEY_SID || !process.env.TWILIO_API_KEY_SECRET) {
    console.error("❌ ERROR: Twilio credentials not configured");
    console.error("   TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? "✅" : "❌");
    console.error("   TWILIO_API_KEY_SID:", process.env.TWILIO_API_KEY_SID ? "✅" : "❌");
    console.error("   TWILIO_API_KEY_SECRET:", process.env.TWILIO_API_KEY_SECRET ? "✅" : "❌");
    return res.status(500).json({ error: "Twilio credentials not configured" });
  }
  
  console.log("✅ Credentials found, generating token...");

  // Optimized configuration for VoIP
  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWIML_APP_SID, // recommended - this makes outgoing calls use the webhook
    incomingAllow: true, // Allows receiving VoIP calls
  });

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY_SID,
    process.env.TWILIO_API_KEY_SECRET,
    { 
      identity,
      // Token TTL (1 hour by default, sufficient for VoIP)
      ttl: 3600
    }
  );

  token.addGrant(voiceGrant);

  const tokenJwt = token.toJwt();
  console.log(`✅ Token generated successfully for identity: ${identity}`);
  console.log(`   Token length: ${tokenJwt.length} characters`);
  
  res.json({ 
    identity, 
    token: tokenJwt,
    // Additional information for VoIP client
    voip: {
      codec: 'opus', // Recommended codec for better VoIP quality
      supported: true
    }
  });
  
  console.log(`📤 Token sent to client\n`);
});

// Alternative endpoint that receives the number as query parameter
// Useful when device.connect parameters don't reach the main webhook
app.get("/voice-call/:phoneNumber", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const to = req.params.phoneNumber;

  console.log(`=== Alternative call received ===`);
  console.log(`Destination number: ${to}`);

  if (!to) {
    twiml.say("No destination number provided");
    return res.type("text/xml").send(twiml.toString());
  }

  const dial = twiml.dial({
    callerId: process.env.TWILIO_CALLER_ID,
    timeout: 30,
    record: false,
    answerOnMedia: false,
  });

  dial.number(to);

  res.type("text/xml").send(twiml.toString());
});

// Endpoint to handle voice calls (TwiML)
// This endpoint is used when the browser calls a PSTN number
// Full URL: https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice
// This URL must be configured in Twilio Console > TwiML Apps > Voice URL
app.post("/voice", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  // Complete request log for debugging
  console.log("=== Request received at /voice ===");
  console.log("Full body:", req.body);
  console.log("Headers:", req.headers);
  console.log("Query params:", req.query);

  // Try to get 'To' from different places
  // When you use device.connect({ params: { To: phoneNumber } }), 
  // Twilio passes those custom parameters to the webhook
  let to = req.body.To || req.body.to || req.query.To || req.query.to;
  const from = req.body.From || req.body.from || req.query.From || req.query.from;

  // If 'To' comes in call parameters (when using device.connect with params)
  if (!to && req.body.Called) {
    // When Twilio calls the webhook, it may use 'Called' for the destination
    to = req.body.Called;
  }

  // Custom parameters from device.connect({ params: { To: ... } })
  // may come directly in the body with the same name
  // Also check all body fields in case it comes with another name
  if (!to && req.body) {
    // Search for any field that might contain the number
    const bodyKeys = Object.keys(req.body);
    for (const key of bodyKeys) {
      const value = req.body[key];
      // Check if the value looks like a phone number (contains + or is a number)
      if (value && typeof value === 'string' && value.trim() !== '' && 
          (key.toLowerCase().includes('to') || key.toLowerCase().includes('called') ||
           key.toLowerCase().includes('number') || key.toLowerCase().includes('phone'))) {
        // Verify it's a valid number (contains + or only digits)
        if (value.match(/^\+?[1-9]\d{1,14}$/) || value.includes('+')) {
          to = value;
          console.log(`Found 'To' in field: ${key} = ${value}`);
          break;
        }
      }
    }
  }

  // IMPORTANT: When you use device.connect({ params: { To: phoneNumber } }),
  // custom parameters should reach the webhook, but sometimes
  // Twilio doesn't pass them correctly. In that case, we need another solution.
  
  // If the call comes from a client (client:Anonymous) and we don't have 'To',
  // this is a configuration problem. device.connect parameters
  // should arrive, but if not, we need an alternative.

  console.log(`Call from ${from} to ${to}`);
  
  // Additional log for debugging
  if (from && from.startsWith('client:')) {
    console.log("⚠️ Web client call detected");
    console.log("device.connect({ params: { To: ... } }) parameters should arrive here");
  }

  // If we don't have 'To', but the call comes from a client (client:Anonymous),
  // this means it's a call from the browser that needs a destination
  // In this case, we need the frontend to pass the number another way
  // or we can use a value stored in session/cache, but the best is
  // that the frontend passes the number correctly in the params
  
  if (!to || to.trim() === '') {
    console.error("ERROR: 'To' parameter not found or is empty");
    console.error("Body received:", JSON.stringify(req.body, null, 2));
    console.error("Query received:", JSON.stringify(req.query, null, 2));
    console.error("\n⚠️ IMPORTANT: When using 'Call using Twilio Client',");
    console.error("the 'To' parameter must be sent in device.connect({ params: { To: 'number' } })");
    console.error("and Twilio will pass it to the webhook.");
    console.error("\n💡 SOLUTION: Verify that:");
    console.error("1. Frontend is sending: device.connect({ params: { To: phoneNumber } })");
    console.error("2. Number has correct format (e.g.: +14063445815)");
    console.error("3. TwiML App has Voice URL configured correctly\n");
    
    // Return TwiML that indicates error but doesn't break the call
    twiml.say("No destination number provided. Please verify the configuration.");
    return res.type("text/xml").send(twiml.toString());
  }

  // Optimized configuration for VoIP to PSTN
  const dial = twiml.dial({
    callerId: process.env.TWILIO_CALLER_ID || req.body.From,
    timeout: 30, // Wait time to connect
    record: false, // Disable recording by default (you can enable it if needed)
    // Audio configuration for better VoIP quality
    answerOnMedia: false,
  });

  // Add number with VoIP configuration
  dial.number({
    // Configuration for better VoIP audio quality
  }, to);

  res.type("text/xml").send(twiml.toString());
});

// Endpoint to handle incoming calls to your Twilio number
// When someone calls +17752619018, Twilio will POST to this endpoint
// Configure in Twilio Console > Phone Numbers > [Your Number] > Voice & Fax
// URL: https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/incoming-call
// Also handles POST to "/" in case Twilio is configured to call root
app.post("/incoming-call", handleIncomingCall);
app.post("/", (req, res) => {
  // Check if this is a Twilio call (has From, To, CallSid)
  if (req.body.From && req.body.To && req.body.CallSid) {
    console.log("\n⚠️ Incoming call detected at root path '/'. Redirecting to handler...");
    return handleIncomingCall(req, res);
  }
  // Otherwise, return 404 for other POST requests to root
  res.status(404).json({ error: "Not found. Use /incoming-call for incoming calls." });
});

// Serve index.html for root GET request
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

function handleIncomingCall(req, res) {
  console.log("\n🔔 INCOMING CALL ENDPOINT HIT!");
  console.log("Request received at:", req.path);
  const twiml = new twilio.twiml.VoiceResponse();
  
  // Log incoming call details
  console.log("\n=== Incoming call received ===");
  console.log("From:", req.body.From);
  console.log("To:", req.body.To);
  console.log("CallSid:", req.body.CallSid);
  console.log("Direction:", req.body.Direction);
  
  // Get the caller's number
  const callerNumber = req.body.From;
  const calledNumber = req.body.To; // Your Twilio number
  
  // Agent identity - you can modify this logic
  // Option 1: Use a default agent identity
  let agentIdentity = process.env.DEFAULT_AGENT_IDENTITY || "agent123";
  
  // Option 2: Route based on caller number (uncomment to use)
  // if (callerNumber === "+14061234567") {
  //   agentIdentity = "agent123";
  // } else if (callerNumber === "+14069876543") {
  //   agentIdentity = "agent456";
  // }
  
  // Option 3: Use query parameter to specify agent (if passed)
  if (req.query.agent) {
    agentIdentity = req.query.agent;
  }
  
  console.log(`Routing call to web client: client:${agentIdentity}`);
  
  // Dial the web client
  const dial = twiml.dial({
    callerId: calledNumber, // Show your Twilio number as caller ID
    timeout: 30, // Wait up to 30 seconds for agent to answer
    answerOnMedia: false,
  });
  
  // Connect to the web client using Client identity
  dial.client(agentIdentity);
  
  // Optional: If agent doesn't answer, you can add a fallback
  // Uncomment the following lines to add a message if agent doesn't answer:
  // twiml.say("The agent is not available. Please try again later.");
  
  console.log(`TwiML generated: Dialing client:${agentIdentity}\n`);
  
  res.type("text/xml").send(twiml.toString());
}

// Endpoint to trigger Studio Flow Execution
// Scenario A: Studio calls the browser
app.post("/studio/execute", async (req, res) => {
  const { identity, to, from, parameters } = req.body;

  if (!process.env.STUDIO_FLOW_SID) {
    return res.status(500).json({ error: "STUDIO_FLOW_SID not configured" });
  }

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return res.status(500).json({ error: "Twilio credentials not configured" });
  }

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    // If identity is provided, destination is client:identity
    const destination = identity ? `client:${identity}` : to;

    const execution = await client.studio.v2
      .flows(process.env.STUDIO_FLOW_SID)
      .executions.create({
        to: destination,
        from: from || process.env.TWILIO_CALLER_ID,
        parameters: parameters || { identity: identity || "agent123" },
      });

    res.json({
      success: true,
      executionSid: execution.sid,
      message: `Flow executed. Call to ${destination}`,
    });
  } catch (error) {
    console.error("Error executing Studio Flow:", error);
    res.status(500).json({
      error: "Error executing Studio Flow",
      details: error.message,
    });
  }
});

// Handle uncaught errors to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Don't exit, let the server continue running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, let the server continue running
});

const PORT = process.env.PORT || 4040;
const HOST = process.env.HOST || '0.0.0.0'; // Railway needs 0.0.0.0 to accept external connections

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📞 Token endpoint: http://${HOST}:${PORT}/token`);
  console.log(`🎤 Voice endpoint: http://${HOST}:${PORT}/voice`);
  console.log(`📥 Incoming call endpoint: http://${HOST}:${PORT}/incoming-call`);
  console.log(`🎬 Studio endpoint: http://${HOST}:${PORT}/studio/execute`);
  console.log(`💚 Health check: http://${HOST}:${PORT}/health`);
  console.log(`\n🌐 ngrok URL configured:`);
  console.log(`   https://alton-aerobiologic-pulchritudinously.ngrok-free.dev`);
  console.log(`   Voice URL: https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`);
  console.log(`   Incoming Call URL: https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/incoming-call`);
  console.log(`\n⚠️  Make sure to configure these URLs in Twilio Console:`);
  console.log(`   - TwiML Apps > Voice URL`);
  console.log(`   - Phone Numbers > [Your Number] > Voice & Fax > A CALL COMES IN`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});
