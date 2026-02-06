# Keycloak Production Configuration Guide

## Server Details

- **Keycloak URL**: `https://lemur-9.cloud-iam.com/auth`
- **Realm**: `onesaas-auth`
- **Application**: OneSAAS Issue Tracker  - **Production URL**: `https://frontend-three-brown-95.vercel.app`

## Required Environment Variables for Vercel

Add these to your Vercel project (Settings → Environment Variables → Production):

```bash
# Set auth mode to use Keycloak
NEXT_PUBLIC_AUTH_MODE=keycloak

# Keycloak Server Configuration
NEXT_PUBLIC_KEYCLOAK_URL=https://lemur-9.cloud-iam.com/auth
NEXT_PUBLIC_KEYCLOAK_REALM=onesaas-auth
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=<YOUR_CLIENT_ID>

# Novu Notifications
NEXT_PUBLIC_NOVU_APP_ID=rPNktu-ZF0Xq
```

## Finding Your Client ID

### Method 1: From Keycloak Admin Panel
1. Log into Keycloak Admin: `https://lemur-9.cloud-iam.com/auth/admin`
2. Select realm: `onesaas-auth`
3. Go to **Clients** in left sidebar
4. Look for your client (likely named something like "onesaas-auth", "issue-tracker", or "frontend")
5. Click on it - the **Client ID** will be shown at the top of the settings page

### Method 2: From Screenshot URL
From your screenshot, the URL shows:
```
/clients/db73488d-7182-4g84-9f6d-d4035338775f/settings
```

The UUID `db73488d-7182-4g84-9f6d-d4035338775f` appears to be the internal client identifier, but there should be a user-friendly **Client ID** field in the General Settings section.

**Look for**: A field labeled "Client ID" (different from the UUID in the URL)

## Client Configuration Verification

Your Keycloak client should have these settings:

### ✅ Already Configured (from screenshot):

**Access Settings**:
- Root URL: `https://frontend-three-brown-95.vercel.app/`
- Home URL: `https://frontend-three-brown-95.vercel.app/`
- Valid Redirect URIs:
  - `https://frontend-three-brown-95.vercel.app/*`
  - `https://*.vercel.app/*`
  - `http://localhost:3000/*`
- Valid Post Logout Redirect URIs:
  - `https://frontend-three-brown-95.vercel.app/*`

### ⚠️ Additional Settings to Verify:

**General Settings** (scroll up from Access Settings):
- Client ID: `<need to discover>`
- Name: OneSAAS Issue Tracker (or similar)
- Enabled: ON

**Capability Config**:
- Client authentication: OFF (for public SPA)
- Authorization: OFF
- Standard flow: ON
- Direct access grants: OFF (typically)

**Login Settings**:
- Login theme: (default is fine)

**Web Origins** (very important for CORS):
- Add: `https://frontend-three-brown-95.vercel.app`
- Add: `https://*.vercel.app` (if supported)
- Add: `http://localhost:3000` (for local dev)

## How to Add Environment Variables in Vercel

### Via Web Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar
5. Add each variable:
   - Click **Add New**
   - Key: `NEXT_PUBLIC_AUTH_MODE`
   - Value: `keycloak`
   - Environment: Select **Production** (important!)
   - Click **Save**
6. Repeat for all variables above
7. **Redeploy**: Go to Deployments → Latest → ⋯ → Redeploy

### Via CLI:
```bash
# Set auth mode
vercel env add NEXT_PUBLIC_AUTH_MODE
# Enter: keycloak
# Select: Production

# Set Keycloak URL
vercel env add NEXT_PUBLIC_KEYCLOAK_URL
# Enter: https://lemur-9.cloud-iam.com/auth
# Select: Production

# Set realm
vercel env add NEXT_PUBLIC_KEYCLOAK_REALM
# Enter: onesaas-auth
# Select: Production

# Set client ID (after you find it)
vercel env add NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
# Enter: <your-client-id>
# Select: Production

# Set Novu
vercel env add NEXT_PUBLIC_NOVU_APP_ID
# Enter: rPNktu-ZF0Xq
# Select: Production

# Redeploy
vercel --prod
```

## Testing After Configuration

### 1. Check Console Logs
Open browser console (F12) and look for:
```
[Providers] Auth Config Check: {
  authMode: "keycloak",
  effectiveShouldUseMock: false,
  keycloakUrl: "https://lemur-9.cloud-iam.com/auth",
  ...
}
```

### 2. Test Login Flow
1. Click "Sign In" button
2. Should redirect to: `https://lemur-9.cloud-iam.com/auth/realms/onesaas-auth/protocol/openid-connect/auth...`
3. Enter your Keycloak credentials
4. Should redirect back to your app
5. You should be logged in

### 3. Verify Novu
After successful login:
- Notification bell icon should appear in header
- Console should show Novu initialization logs

## Troubleshooting

### Error: "Invalid redirect_uri"
**Solution**: Check that Valid Redirect URIs in Keycloak include:
- `https://frontend-three-brown-95.vercel.app/*`

### Error: CORS / "Access-Control-Allow-Origin"
**Solution**: Add to Web Origins in Keycloak client settings:
- `https://frontend-three-brown-95.vercel.app`

### Error: "Client not found"
**Solution**: Double-check `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` matches exactly

### Login keeps redirecting/looping
**Solution**: Already handled in code (`checkLoginIframe: false`). If persists, check:
- Cookies are enabled in browser
- Valid Redirect URIs are correct

## Test User Creation

If you don't have test users:

1. In Keycloak Admin, go to **Users** → **Add user**
2. Set:
   - Username: `testuser`
   - Email: `testuser@onesaas.com`
   - Email Verified: ON
   - Enabled: ON
3. Click **Create**
4. Go to **Credentials** tab
5. Click **Set password**
6. Enter password
7. Set "Temporary": OFF
8. Click **Save**

Now you can log in with `testuser` / `password`.

## Summary Checklist

- [ ] Find Client ID from Keycloak admin panel
- [ ] Add all environment variables to Vercel (Production)
- [ ] Verify Web Origins in Keycloak includes production URL
- [ ] Create test user (if needed)
- [ ] Redeploy Vercel application
- [ ] Test login flow
- [ ] Verify Novu notifications appear
