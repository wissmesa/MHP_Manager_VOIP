# Configuración para "Call using Twilio Client"

## Problema

Cuando usas `device.connect({ params: { To: phoneNumber } })` desde el navegador, los parámetros personalizados **NO** se pasan automáticamente al webhook de la TwiML App.

## Solución

Hay dos formas de resolver esto:

### Opción 1: Usar el parámetro en la URL del webhook (Recomendado)

En lugar de pasar el `To` en los `params` de `device.connect`, puedes:

1. **Modificar el frontend** para no pasar `To` en params
2. **Usar un endpoint diferente** que reciba el número como query parameter
3. **O configurar la TwiML App** para que use una URL con el número

### Opción 2: Pasar el número de otra manera

El problema es que cuando Twilio llama al webhook configurado en la TwiML App, los parámetros personalizados de `device.connect` no siempre llegan correctamente.

**Solución temporal**: Podemos modificar el código para que cuando `To` esté vacío, use un valor por defecto o solicite el número de otra forma.

## Configuración Actual

Tu TwiML App está configurada con:
- **Request URL**: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`
- **Request Method**: `HTTP POST`

Cuando el navegador llama usando `device.connect({ params: { To: phoneNumber } })`, Twilio debería pasar esos parámetros al webhook, pero parece que no están llegando.

## Próximos Pasos

1. Verificar que el número se esté enviando correctamente desde el frontend
2. Modificar el endpoint para manejar el caso cuando `To` viene vacío
3. Considerar usar un enfoque diferente para pasar el número destino
