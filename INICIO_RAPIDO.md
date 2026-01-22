# Inicio Rápido - Comandos

## Para iniciar el servidor y ngrok correctamente:

### Terminal 1 - Servidor Node.js
```bash
npm start
```

### Terminal 2 - ngrok (apuntando al puerto 4040)
```bash
ngrok http 4040
```

**IMPORTANTE**: ngrok debe apuntar al puerto **4040**.

## Verificar que todo funciona:

1. El servidor debe mostrar:
   ```
   🚀 Servidor corriendo en http://localhost:4040
   ```

2. ngrok debe mostrar:
   ```
   Forwarding: https://alton-aerobiologic-pulchritudinously.ngrok-free.dev -> http://localhost:4040
   ```

3. Prueba el endpoint:
   - Abre: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/token?identity=test`
   - Deberías recibir un JSON con un token

## Si ves errores 502:

- ✅ Verifica que el servidor esté corriendo en el puerto 4040
- ✅ Verifica que ngrok esté apuntando al puerto 4040
- ✅ Reinicia ambos si es necesario
