# Configuración de ngrok

## URL de ngrok configurada

**URL base**: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev`

## Endpoints disponibles

- **Token endpoint**: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/token`
- **Voice endpoint** (TwiML): `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`
- **Studio execute endpoint**: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/studio/execute`

## Configuración en Twilio Console

### TwiML Application

1. Ve a [Twilio Console > TwiML Apps](https://console.twilio.com/us1/develop/phone-numbers/manage/twiml-apps)
2. Selecciona tu TwiML App (o créala si no existe)
3. En la sección **Voice Configuration**:
   - **Voice URL**: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`
   - **HTTP Method**: `POST`
4. Guarda los cambios

## Iniciar ngrok

Para que funcione, necesitas tener ngrok corriendo:

```bash
ngrok http 4040
```

Asegúrate de que:
- El servidor esté corriendo en el puerto 4040 (`npm start`)
- ngrok esté activo y apuntando al puerto 4040
- La URL de ngrok coincida con la configurada en Twilio Console

## Verificar configuración

Para verificar que todo está configurado correctamente:

1. Inicia el servidor: `npm start`
2. Inicia ngrok: `ngrok http 3000`
3. Verifica que ngrok muestre la URL: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev`
4. Prueba el endpoint de token: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/token?identity=test`

Si todo está bien, deberías recibir un token JSON como respuesta.
