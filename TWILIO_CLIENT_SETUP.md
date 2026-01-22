# Configuration for "Call using Twilio Client"

## Problem

When you use `device.connect({ params: { To: phoneNumber } })` from the browser, custom parameters **DO NOT** automatically pass to the TwiML App webhook.

## Solution

There are two ways to resolve this:

### Option 1: Use parameter in webhook URL (Recommended)

Instead of passing `To` in `device.connect` params, you can:

1. **Modify the frontend** to not pass `To` in params
2. **Use a different endpoint** that receives the number as a query parameter
3. **Or configure the TwiML App** to use a URL with the number

### Option 2: Pass the number another way

The problem is that when Twilio calls the webhook configured in the TwiML App, custom parameters from `device.connect` don't always arrive correctly.

**Temporary solution**: We can modify the code so that when `To` is empty, it uses a default value or requests the number another way.

## Current Configuration

Your TwiML App is configured with:
- **Request URL**: `https://alton-aerobiologic-pulchritudinously.ngrok-free.dev/voice`
- **Request Method**: `HTTP POST`

When the browser calls using `device.connect({ params: { To: phoneNumber } })`, Twilio should pass those parameters to the webhook, but it seems they're not arriving.

## Next Steps

1. Verify that the number is being sent correctly from the frontend
2. Modify the endpoint to handle the case when `To` comes empty
3. Consider using a different approach to pass the destination number
