# Twilio Voice SDK - VoIP Calling Application

This application implements two scenarios for using Twilio Voice SDK with full **VoIP (Voice over IP)** support:

## Scenario A: Studio calls the browser (Web Agent / VoIP Softphone)
Allows a Studio Flow to make a VoIP call to a web client authenticated in the browser. The agent receives high-quality calls using VoIP technology.

## Scenario B: Click-to-call from web to PSTN (VoIP to PSTN)
Allows a user in the browser to click and call a phone number (PSTN) using VoIP. Includes two options: direct call with TwiML or using Studio Flow as orchestrator.

## Implemented VoIP Features

✅ **Optimized codecs**: Opus (priority) and PCMU as fallback for maximum audio quality  
✅ **Audio controls**: Mute/Unmute during calls  
✅ **Real-time statistics**: Codec used, call status, duration  
✅ **Automatic token renewal**: Automatic handling of token expiration  
✅ **Robust event handling**: Reconnection, errors, cancellations  
✅ **Optimized configuration**: Specific settings for VoIP (RTC stats, audio devices)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables (see `ENV_SETUP.md` for details):
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_CALLER_ID=+17547151546
TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STUDIO_FLOW_SID=FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=4040
```

3. Configure in Twilio Console:
   - Create a TwiML Application (Phone Numbers > TwiML Apps)
   - Configure the Voice URL: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`
   - Copy the TwiML App SID to `TWIML_APP_SID` in `.env`
   - Get your credentials: Account SID, API Key (SID and Secret), Auth Token

4. Start the server:
```bash
npm start
```

5. Open in browser:
   - Main page: `http://localhost:4040/`
   - Scenario A: `http://localhost:4040/scenario-a.html`
   - Scenario B: `http://localhost:4040/scenario-b.html`

**Note**: The configured ngrok URL is `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev`
- Make sure ngrok is running and pointing to port 4040
- The Voice URL in TwiML App must be: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`

## Backend Endpoints

- `GET /token?identity=agent123` - Generates an Access Token for the web client
- `POST /voice` - Handles incoming calls and generates TwiML
- `POST /studio/execute` - Triggers a Studio Flow execution

## Requirements

- Node.js 18+
- Twilio account with Voice-capable number
- HTTPS for production (or ngrok for development)
- Microphone permissions in browser
- Modern browser with WebRTC support (Chrome, Firefox, Edge, Safari)

## Detailed VoIP Features

### Audio Quality
- **Opus Codec**: Prioritized for better VoIP audio quality
- **PCMU Codec**: Fallback for compatibility
- **RTC Configuration**: Real-time connection statistics

### During Call Controls
- **Mute/Unmute**: Mute and unmute microphone during call
- **Statistics**: View codec used, status and call duration
- **Event handling**: Accept, reject, cancel, disconnect

### Reconnection and Stability
- **Automatic token renewal**: Tokens are automatically renewed before expiring
- **Error handling**: Connection, network and device errors handled correctly
- **Detailed logs**: Log level configured for VoIP debugging
