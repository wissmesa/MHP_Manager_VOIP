# Quick Start - Commands

## To start the server and ngrok correctly:

### Terminal 1 - Node.js Server
```bash
npm start
```

### Terminal 2 - ngrok (pointing to port 4040)
```bash
ngrok http 4040
```

**IMPORTANT**: ngrok must point to port **4040**.

## Verify everything works:

1. The server should show:
   ```
   🚀 Server running on http://localhost:4040
   ```

2. ngrok should show:
   ```
   Forwarding: https://alton-aerobiologic-pulchritudinously.ngrok-free.dev -> http://localhost:4040
   ```

3. Test the endpoint:
   - Open: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/token?identity=test`
   - You should receive a JSON with a token

## If you see 502 errors:

- ✅ Verify that the server is running on port 4040
- ✅ Verify that ngrok is pointing to port 4040
- ✅ Restart both if necessary
