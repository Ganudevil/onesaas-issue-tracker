# Vercel Environment Variables - Production Setup

This document explains the required environment variables for the production deployment on Vercel.

## Required Environment Variables

### Authentication Configuration

#### Option 1: Mock Authentication Mode (Recommended for Demo/Testing)
```bash
NEXT_PUBLIC_AUTH_MODE=mock
# OR
NEXT_PUBLIC_USE_MOCK=true
```

**When to use**: For demo/testing deployments where you don't have a production Keycloak server.

#### Option 2: Real Keycloak Authentication
```bash
NEXT_PUBLIC_AUTH_MODE=keycloak
NEXT_PUBLIC_KEYCLOAK_URL=https://your-keycloak-server.com/auth
NEXT_PUBLIC_KEYCLOAK_REALM=your-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=your-client-id
```

**When to use**: For production deployments with a configured Keycloak server.

### Novu Notifications (Required)
```bash
NEXT_PUBLIC_NOVU_APP_ID=rPNktu-ZF0Xq
```

This enables the notification bell icon in the application header.

## How to Add Environment Variables in Vercel

### Via Verceldashboard:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`frontend-three-brown-95`)
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Key**: Variable name (e.g., `NEXT_PUBLIC_AUTH_MODE`)
   - **Value**: Variable value (e.g., `mock`)
   - **Environment**: Select "Production" (or All)
5. Click **Save**
6. **Important**: Redeploy for changes to take effect

### Via Vercel CLI:
```bash
# Set auth mode to mock
vercel env add NEXT_PUBLIC_AUTH_MODE
# When prompted, enter: mock
# Select: Production

# Set Novu App ID
vercel env add NEXT_PUBLIC_NOVU_APP_ID
# When prompted, enter: rPNktu-ZF0Xq
# Select: Production

# Trigger redeployment
vercel --prod
```

## Auto-Detection Logic

The application automatically detects the appropriate auth mode based on:

1. **Explicit Mode**: If `NEXT_PUBLIC_AUTH_MODE` is set, it uses that value
2. **Fallback to Mock**: If `NEXT_PUBLIC_USE_MOCK=true`, uses mock mode
3. **Auto-Detect**: If Keycloak URL is:
   - Missing, empty, or 'undefined' → Mock Mode
   - Points to localhost → Mock Mode
   - Otherwise → Real Keycloak Mode

## Current Production Issue (Fixed)

**Problem**: Production was using real Keycloak (`https://lemur-9.cloud-iam.com/auth`) but users couldn't authenticate.

**Solution**: Set `NEXT_PUBLIC_AUTH_MODE=mock` or `NEXT_PUBLIC_USE_MOCK=true` in Vercel environment variables.

## Verification

After adding environment variables and redeploying:

1. Visit https://frontend-three-brown-95.vercel.app
2. Open browser console (F12)
3. Look for log: `[Providers] Auth Config Check:`
4. Verify: `effectiveShouldUseMock: true` (if using mock mode)
5. Click "Sign In" → Should authenticate immediately
6. Notification bell should appear in header

## Quick Fix Command

After updating environment variables in Vercel dashboard:

```bash
# Force a new deployment (if auto-deploy doesn't trigger)
git commit --allow-empty -m "trigger deployment with new env vars"
git push origin main
```

Or manually redeploy from the Vercel dashboard: **Deployments** → **...** → **Redeploy**
