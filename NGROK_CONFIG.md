# ngrok Configuration

## Configured ngrok URL

**Base URL**: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev`

## Available endpoints

- **Token endpoint**: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/token`
- **Voice endpoint** (TwiML): `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`
- **Studio execute endpoint**: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/studio/execute`

## Configuration in Twilio Console

### TwiML Application

1. Go to [Twilio Console > TwiML Apps](https://console.twilio.com/us1/develop/phone-numbers/manage/twiml-apps)
2. Select your TwiML App (or create it if it doesn't exist)
3. In the **Voice Configuration** section:
   - **Voice URL**: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`
   - **HTTP Method**: `POST`
4. Save changes

## Start ngrok

For it to work, you need to have ngrok running:

```bash
ngrok http 4040
```

Make sure that:
- The server is running on port 4040 (`npm start`)
- ngrok is active and pointing to port 4040
- The ngrok URL matches the one configured in Twilio Console

## Verify configuration

To verify that everything is configured correctly:

1. Start the server: `npm start`
2. Start ngrok: `ngrok http 4040`
3. Verify that ngrok shows the URL: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev`
4. Test the token endpoint: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/token?identity=test`

If everything is correct, you should receive a JSON token as a response.
