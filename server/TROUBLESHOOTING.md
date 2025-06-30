# Cognito Authentication Troubleshooting Guide

## Current Issue: `invalid_client` Error

This error occurs when there's a mismatch between your server configuration and your AWS Cognito App Client settings.

## Step-by-Step Fix

### 1. Check Your Cognito App Client Configuration

1. **Go to AWS Console** → **Cognito** → **User Pools**
2. **Select your User Pool** (us-east-2_Lylzuyppl)
3. **Go to "App clients"** tab
4. **Find your app client** (ID: 4ecd14vqq0niscmt2lhv7cqac7)

### 2. Configure as Public Client

**IMPORTANT**: Your app client must be configured as a **public client**:

1. **Click on your app client**
2. **Make sure "Generate client secret" is UNCHECKED**
3. **Save changes**

### 3. Verify Redirect URIs

In your Cognito App Client settings, ensure these redirect URIs are configured:

```
http://localhost:5001/auth/callback
http://localhost:3000/callback
```

### 4. Verify Logout URIs

Add this logout URI:
```
http://localhost:3000/
```

### 5. Check OAuth Settings

Make sure these OAuth settings are enabled:
- ✅ Authorization code grant
- ✅ Implicit grant
- ✅ Allowed OAuth Flows: Authorization code grant, Implicit grant
- ✅ Allowed OAuth Scopes: email, openid, phone

## Alternative Solution: Use Confidential Client

If you prefer to keep your app client as confidential, update your server configuration:

### Option A: Add Client Secret to Environment

1. **Get your client secret** from Cognito App Client settings
2. **Create a `.env` file** in the server directory:

```env
COGNITO_CLIENT_ID=4ecd14vqq0niscmt2lhv7cqac7
COGNITO_CLIENT_SECRET=your_actual_client_secret_here
COGNITO_USER_POOL_ID=us-east-2_Lylzuyppl
COGNITO_REGION=us-east-2
COGNITO_DOMAIN=us-east-2lylzuyppl.auth.us-east-2.amazoncognito.com
```

3. **Update server.js** to use the client secret:

```javascript
client = new issuer.Client({
  client_id: clientId,
  client_secret: process.env.COGNITO_CLIENT_SECRET,
  redirect_uris: ['http://localhost:5001/auth/callback'],
  response_types: ['code'],
});
```

## Testing the Fix

1. **Restart your server** after making changes
2. **Try the login flow** again
3. **Check server logs** for any new errors

## Common Issues

### Issue: "client_id is required"
- ✅ **Fixed**: Server configuration issue resolved

### Issue: "client_secret_basic client authentication method requires a client_secret"
- ✅ **Fixed**: Configured as public client

### Issue: "invalid_client"
- 🔧 **Current**: Need to verify Cognito App Client settings

### Issue: "checks.state argument is missing"
- 🔧 **Current**: Session state management issue

## Debug Information

Current server configuration:
- Client ID: 4ecd14vqq0niscmt2lhv7cqac7
- User Pool: us-east-2_Lylzuyppl
- Region: us-east-2
- Callback URL: http://localhost:5001/auth/callback
- Client Type: Public (no client secret)

## Next Steps

1. **Verify Cognito App Client settings** as described above
2. **Test authentication flow** again
3. **Check server logs** for any remaining errors
4. **Contact AWS Support** if issues persist 