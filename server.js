import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const app = express();
const { AccessToken } = twilio.jwt;
const { VoiceGrant } = AccessToken;

app.use(cors());
app.use(express.json());
// Configuration to receive data from Twilio (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

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

const PORT = process.env.PORT || 4040;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📞 Token endpoint: http://localhost:${PORT}/token`);
  console.log(`🎤 Voice endpoint: http://localhost:${PORT}/voice`);
  console.log(`🎬 Studio endpoint: http://localhost:${PORT}/studio/execute`);
  console.log(`\n🌐 ngrok URL configured:`);
  console.log(`   https://alton-aerobiologic-pulchritudinously.ngrok-free.dev`);
  console.log(`   Voice URL: https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`);
  console.log(`\n⚠️  Make sure to configure this URL in Twilio Console > TwiML Apps`);
});
