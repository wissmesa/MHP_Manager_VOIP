# Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

## Variables Requeridas

```env
# Twilio Account SID (obligatorio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio API Key SID (obligatorio para Access Tokens)
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio API Key Secret (obligatorio para Access Tokens)
TWILIO_API_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio Auth Token (obligatorio para Studio Executions)
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Número de Twilio (Voice-capable) - usado como Caller ID
TWILIO_CALLER_ID=+17547151546
```

## Variables Opcionales (pero recomendadas)

```env
# TwiML Application SID
# Crea una en: Twilio Console > Phone Numbers > TwiML Apps
# Configura la Voice URL: https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice
TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Studio Flow SID (para disparar ejecuciones)
# Encuéntralo en: Twilio Console > Studio > Flows
STUDIO_FLOW_SID=FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Puerto del servidor (default: 4040)
PORT=4040
```

## Cómo obtener las credenciales

1. **TWILIO_ACCOUNT_SID**: En Twilio Console, está en el dashboard principal
2. **TWILIO_API_KEY_SID y TWILIO_API_KEY_SECRET**: 
   - Ve a Twilio Console > Account > API Keys & Tokens
   - Crea una nueva API Key
   - Copia el SID y el Secret (solo se muestra una vez)
3. **TWILIO_AUTH_TOKEN**: 
   - En Twilio Console > Account > API Keys & Tokens
   - Está en "Auth Token" (puedes regenerarlo si es necesario)
4. **TWIML_APP_SID**:
   - Ve a Twilio Console > Phone Numbers > TwiML Apps
   - Crea una nueva TwiML App
   - Configura la Voice URL: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`
   - Copia el SID
5. **STUDIO_FLOW_SID**:
   - Ve a Twilio Console > Studio > Flows
   - Selecciona tu Flow
   - El SID está en la URL o en los detalles del Flow

## Configuración de ngrok

La URL de ngrok configurada para este proyecto es:

**URL de ngrok**: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev`

**Voice URL para TwiML App**: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`

### Configurar en Twilio Console

1. Ve a Twilio Console > Phone Numbers > TwiML Apps
2. Selecciona o crea tu TwiML App
3. En **Voice Configuration**, configura:
   - **Voice URL**: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`
   - **HTTP Method**: `POST`
4. Guarda los cambios

**Nota**: Asegúrate de que tu servidor esté corriendo en el puerto 3000 y que ngrok esté activo apuntando a ese puerto.
