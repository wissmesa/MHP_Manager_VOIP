# Twilio Voice SDK - Aplicación de Llamadas VoIP

Esta aplicación implementa dos escenarios para usar Twilio Voice SDK con soporte completo de **VoIP (Voice over IP)**:

## Escenario A: Studio llama al navegador (Agente Web / Softphone VoIP)
Permite que un Flow de Studio haga una llamada VoIP a un cliente web autenticado en el navegador. El agente recibe llamadas de alta calidad usando tecnología VoIP.

## Escenario B: Click-to-call desde la web a PSTN (VoIP a PSTN)
Permite que un usuario en el navegador haga click y llame a un número telefónico (PSTN) usando VoIP. Incluye dos opciones: llamada directa con TwiML o usando Studio Flow como orquestador.

## Características VoIP Implementadas

✅ **Codecs optimizados**: Opus (prioritario) y PCMU como fallback para máxima calidad de audio  
✅ **Controles de audio**: Mute/Unmute durante las llamadas  
✅ **Estadísticas en tiempo real**: Codec usado, estado de llamada, duración  
✅ **Renovación automática de tokens**: Manejo automático de expiración de tokens  
✅ **Manejo robusto de eventos**: Reconexión, errores, cancelaciones  
✅ **Configuración optimizada**: Ajustes específicos para VoIP (RTC stats, audio devices)

## Configuración

1. Instala las dependencias:
```bash
npm install
```

2. Crea un archivo `.env` con las siguientes variables (ver `ENV_SETUP.md` para detalles):
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_CALLER_ID=+17547151546
TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STUDIO_FLOW_SID=FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=3000
```

3. Configura en Twilio Console:
   - Crea una TwiML Application (Phone Numbers > TwiML Apps)
   - Configura la Voice URL: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`
   - Copia el SID de la TwiML App a `TWIML_APP_SID` en `.env`
   - Obtén tus credenciales: Account SID, API Key (SID y Secret), Auth Token

4. Inicia el servidor:
```bash
npm start
```

5. Abre en el navegador:
   - Página principal: `http://localhost:4040/`
   - Escenario A: `http://localhost:4040/escenario-a.html`
   - Escenario B: `http://localhost:4040/escenario-b.html`

**Nota**: La URL de ngrok configurada es `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev`
- Asegúrate de que ngrok esté corriendo y apuntando al puerto 4040
- La Voice URL en TwiML App debe ser: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`

## Endpoints del Backend

- `GET /token?identity=agente123` - Genera un Access Token para el cliente web
- `POST /voice` - Maneja llamadas entrantes y genera TwiML
- `POST /studio/execute` - Dispara una ejecución de Studio Flow

## Requisitos

- Node.js 18+
- Cuenta de Twilio con número Voice-capable
- HTTPS para producción (o ngrok para desarrollo)
- Permisos de micrófono en el navegador
- Navegador moderno con soporte WebRTC (Chrome, Firefox, Edge, Safari)

## Características VoIP Detalladas

### Calidad de Audio
- **Codec Opus**: Priorizado para mejor calidad de audio VoIP
- **Codec PCMU**: Fallback para compatibilidad
- **Configuración RTC**: Estadísticas en tiempo real de la conexión

### Controles Durante la Llamada
- **Mute/Unmute**: Silenciar y activar micrófono durante la llamada
- **Estadísticas**: Ver codec usado, estado y duración de la llamada
- **Manejo de eventos**: Aceptar, rechazar, cancelar, desconectar

### Reconexión y Estabilidad
- **Renovación automática de tokens**: Los tokens se renuevan automáticamente antes de expirar
- **Manejo de errores**: Errores de conexión, red y dispositivo manejados correctamente
- **Logs detallados**: Nivel de log configurado para debugging VoIP
