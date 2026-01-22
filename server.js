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
// Configuración para recibir datos de Twilio (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Endpoint para generar Access Token
app.get("/token", (req, res) => {
  const identity = req.query.identity || "agente123";
  
  console.log(`\n🔑 Solicitud de token recibida para identity: ${identity}`);
  console.log(`📋 Query params:`, req.query);

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_API_KEY_SID || !process.env.TWILIO_API_KEY_SECRET) {
    console.error("❌ ERROR: Twilio credentials no configuradas");
    console.error("   TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? "✅" : "❌");
    console.error("   TWILIO_API_KEY_SID:", process.env.TWILIO_API_KEY_SID ? "✅" : "❌");
    console.error("   TWILIO_API_KEY_SECRET:", process.env.TWILIO_API_KEY_SECRET ? "✅" : "❌");
    return res.status(500).json({ error: "Twilio credentials no configuradas" });
  }
  
  console.log("✅ Credenciales encontradas, generando token...");

  // Configuración optimizada para VoIP
  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWIML_APP_SID, // recomendado - esto hace que las llamadas salientes usen el webhook
    incomingAllow: true, // Permite recibir llamadas VoIP
  });

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY_SID,
    process.env.TWILIO_API_KEY_SECRET,
    { 
      identity,
      // TTL del token (1 hora por defecto, suficiente para VoIP)
      ttl: 3600
    }
  );

  token.addGrant(voiceGrant);

  const tokenJwt = token.toJwt();
  console.log(`✅ Token generado exitosamente para identity: ${identity}`);
  console.log(`   Token length: ${tokenJwt.length} caracteres`);
  
  res.json({ 
    identity, 
    token: tokenJwt,
    // Información adicional para el cliente VoIP
    voip: {
      codec: 'opus', // Codec recomendado para mejor calidad VoIP
      supported: true
    }
  });
  
  console.log(`📤 Token enviado al cliente\n`);
});

// Endpoint alternativo que recibe el número como query parameter
// Útil cuando los parámetros de device.connect no llegan al webhook principal
app.get("/voice-call/:phoneNumber", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const to = req.params.phoneNumber;

  console.log(`=== Llamada alternativa recibida ===`);
  console.log(`Número destino: ${to}`);

  if (!to) {
    twiml.say("No se proporcionó un número de destino");
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

// Endpoint para manejar llamadas de voz (TwiML)
// Este endpoint se usa cuando el navegador llama a un número PSTN
// URL completa: https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice
// Esta URL debe configurarse en Twilio Console > TwiML Apps > Voice URL
app.post("/voice", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  // Log completo del request para debugging
  console.log("=== Request recibido en /voice ===");
  console.log("Body completo:", req.body);
  console.log("Headers:", req.headers);
  console.log("Query params:", req.query);

  // Intentar obtener 'To' de diferentes lugares
  // Cuando usas device.connect({ params: { To: phoneNumber } }), 
  // Twilio pasa esos parámetros personalizados al webhook
  let to = req.body.To || req.body.to || req.query.To || req.query.to;
  const from = req.body.From || req.body.from || req.query.From || req.query.from;

  // Si 'To' viene en los parámetros de la llamada (cuando se usa device.connect con params)
  if (!to && req.body.Called) {
    // Cuando Twilio llama al webhook, puede usar 'Called' para el destino
    to = req.body.Called;
  }

  // Los parámetros personalizados de device.connect({ params: { To: ... } })
  // pueden venir directamente en el body con el mismo nombre
  // También verificar todos los campos del body por si viene con otro nombre
  if (!to && req.body) {
    // Buscar cualquier campo que pueda contener el número
    const bodyKeys = Object.keys(req.body);
    for (const key of bodyKeys) {
      const value = req.body[key];
      // Verificar si el valor parece un número de teléfono (contiene + o es un número)
      if (value && typeof value === 'string' && value.trim() !== '' && 
          (key.toLowerCase().includes('to') || key.toLowerCase().includes('called') ||
           key.toLowerCase().includes('number') || key.toLowerCase().includes('phone'))) {
        // Verificar que sea un número válido (contiene + o solo dígitos)
        if (value.match(/^\+?[1-9]\d{1,14}$/) || value.includes('+')) {
          to = value;
          console.log(`Encontrado 'To' en el campo: ${key} = ${value}`);
          break;
        }
      }
    }
  }

  // IMPORTANTE: Cuando usas device.connect({ params: { To: phoneNumber } }),
  // los parámetros personalizados deberían llegar al webhook, pero a veces
  // Twilio no los pasa correctamente. En ese caso, necesitamos otra solución.
  
  // Si la llamada viene desde un cliente (client:Anonymous) y no tenemos 'To',
  // esto es un problema de configuración. Los parámetros de device.connect
  // deberían llegar, pero si no, necesitamos una alternativa.

  console.log(`Llamada desde ${from} a ${to}`);
  
  // Log adicional para debugging
  if (from && from.startsWith('client:')) {
    console.log("⚠️ Llamada desde cliente web detectada");
    console.log("Los parámetros de device.connect({ params: { To: ... } }) deberían llegar aquí");
  }

  // Si no tenemos 'To', pero la llamada viene desde un cliente (client:Anonymous),
  // esto significa que es una llamada desde el navegador que necesita un destino
  // En este caso, necesitamos que el frontend pase el número de otra manera
  // o podemos usar un valor almacenado en sesión/cache, pero lo mejor es
  // que el frontend pase el número correctamente en los params
  
  if (!to || to.trim() === '') {
    console.error("ERROR: No se encontró el parámetro 'To' o está vacío");
    console.error("Body recibido:", JSON.stringify(req.body, null, 2));
    console.error("Query recibido:", JSON.stringify(req.query, null, 2));
    console.error("\n⚠️ IMPORTANTE: Cuando usas 'Call using Twilio Client',");
    console.error("el parámetro 'To' debe enviarse en device.connect({ params: { To: 'número' } })");
    console.error("y Twilio lo pasará al webhook.");
    console.error("\n💡 SOLUCIÓN: Verifica que:");
    console.error("1. El frontend esté enviando: device.connect({ params: { To: phoneNumber } })");
    console.error("2. El número tenga el formato correcto (ej: +14063445815)");
    console.error("3. La TwiML App tenga configurada la Voice URL correctamente\n");
    
    // Devolver un TwiML que indique el error pero no rompa la llamada
    twiml.say("No se proporcionó un número de destino. Por favor, verifica la configuración.");
    return res.type("text/xml").send(twiml.toString());
  }

  // Configuración optimizada para VoIP a PSTN
  const dial = twiml.dial({
    callerId: process.env.TWILIO_CALLER_ID || req.body.From,
    timeout: 30, // Tiempo de espera para conectar
    record: false, // Desactivar grabación por defecto (puedes activarla si necesitas)
    // Configuración de audio para mejor calidad VoIP
    answerOnMedia: false,
  });

  // Agregar número con configuración VoIP
  dial.number({
    // Configuración para mejor calidad de audio VoIP
  }, to);

  res.type("text/xml").send(twiml.toString());
});

// Endpoint para disparar Studio Flow Execution
// Escenario A: Studio llama al navegador
app.post("/studio/execute", async (req, res) => {
  const { identity, to, from, parameters } = req.body;

  if (!process.env.STUDIO_FLOW_SID) {
    return res.status(500).json({ error: "STUDIO_FLOW_SID no configurado" });
  }

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return res.status(500).json({ error: "Twilio credentials no configuradas" });
  }

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    // Si se proporciona identity, el destino es client:identity
    const destination = identity ? `client:${identity}` : to;

    const execution = await client.studio.v2
      .flows(process.env.STUDIO_FLOW_SID)
      .executions.create({
        to: destination,
        from: from || process.env.TWILIO_CALLER_ID,
        parameters: parameters || { identity: identity || "agente123" },
      });

    res.json({
      success: true,
      executionSid: execution.sid,
      message: `Flow ejecutado. Llamada a ${destination}`,
    });
  } catch (error) {
    console.error("Error ejecutando Studio Flow:", error);
    res.status(500).json({
      error: "Error ejecutando Studio Flow",
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 4040;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📞 Endpoint Token: http://localhost:${PORT}/token`);
  console.log(`🎤 Endpoint Voice: http://localhost:${PORT}/voice`);
  console.log(`🎬 Endpoint Studio: http://localhost:${PORT}/studio/execute`);
  console.log(`\n🌐 URL ngrok configurada:`);
  console.log(`   https://alton-aerobiologic-pulchritudinously.ngrok-free.dev`);
  console.log(`   Voice URL: https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`);
  console.log(`\n⚠️  Asegúrate de configurar esta URL en Twilio Console > TwiML Apps`);
});
