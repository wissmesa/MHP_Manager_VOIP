# Guía de Deployment en Railway

## Problema: `npm error path /app`

Este error indica que Railway no está encontrando el directorio del proyecto correctamente.

## Soluciones a intentar:

### 1. Verificar que todos los archivos estén en la raíz del repositorio
- `package.json` debe estar en la raíz
- `server.js` debe estar en la raíz
- `public/` debe estar en la raíz

### 2. En Railway Dashboard:
- Ve a tu proyecto
- Settings > Build & Deploy
- Verifica que el "Root Directory" esté vacío o sea `/`
- Verifica que el "Start Command" sea `node server.js`

### 3. Si el problema persiste:
- Elimina el servicio en Railway
- Crea un nuevo servicio desde GitHub
- Asegúrate de que el repositorio esté correctamente conectado

### 4. Verifica las variables de entorno:
Asegúrate de tener configuradas todas las variables necesarias:
- `PORT` (Railway lo asigna automáticamente)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_API_KEY_SID`
- `TWILIO_API_KEY_SECRET`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_CALLER_ID`
- `TWIML_APP_SID`
- `STUDIO_FLOW_SID` (opcional)
