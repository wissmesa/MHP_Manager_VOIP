# Environment Variables Setup

Create a `.env` file in the project root with the following variables:

## Required Variables

```env
# Twilio Account SID (required)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio API Key SID (required for Access Tokens)
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio API Key Secret (required for Access Tokens)
TWILIO_API_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio Auth Token (required for Studio Executions)
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio Number (Voice-capable) - used as Caller ID
TWILIO_CALLER_ID=+17547151546
```

## Optional Variables (but recommended)

```env
# TwiML Application SID
# Create one at: Twilio Console > Phone Numbers > TwiML Apps
# Configure the Voice URL: https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice
TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Studio Flow SID (for triggering executions)
# Find it at: Twilio Console > Studio > Flows
STUDIO_FLOW_SID=FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Server port (default: 4040)
PORT=4040
```

## How to get credentials

1. **TWILIO_ACCOUNT_SID**: In Twilio Console, it's on the main dashboard
2. **TWILIO_API_KEY_SID and TWILIO_API_KEY_SECRET**: 
   - Go to Twilio Console > Account > API Keys & Tokens
   - Create a new API Key
   - Copy the SID and Secret (only shown once)
3. **TWILIO_AUTH_TOKEN**: 
   - In Twilio Console > Account > API Keys & Tokens
   - It's in "Auth Token" (you can regenerate it if needed)
4. **TWIML_APP_SID**:
   - Go to Twilio Console > Phone Numbers > TwiML Apps
   - Create a new TwiML App
   - Configure the Voice URL: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`
   - Copy the SID
5. **STUDIO_FLOW_SID**:
   - Go to Twilio Console > Studio > Flows
   - Select your Flow
   - The SID is in the URL or in the Flow details

## ngrok Configuration

The ngrok URL configured for this project is:

**ngrok URL**: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev`

**Voice URL for TwiML App**: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`

### Configure in Twilio Console

1. Go to Twilio Console > Phone Numbers > TwiML Apps
2. Select or create your TwiML App
3. In **Voice Configuration**, configure:
   - **Voice URL**: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`
   - **HTTP Method**: `POST`
4. Save changes

**Note**: Make sure your server is running on port 4040 and that ngrok is active pointing to that port.
