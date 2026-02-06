# Novu Notification Bell - Quick Fix Guide

## Problem

The Novu notification bell is not appearing in the header even though:
- ✅ NovuInbox component exists
- ✅ Component is imported in Navbar
- ✅ Novu workflows are configured and active
- ❌ **Bell not rendering**

## Root Cause

The `NovuInbox` component has safety checks that return `null` if missing:

```typescript
// NovuInbox.tsx line 25
if (!NovuProvider || !PopoverNotificationCenter || !userId || !appId) {
    console.error('[NovuInbox] CRITICAL: Missing components or config');
    return null;  // Bell doesn't render!
}
```

Most likely: **`NEXT_PUBLIC_NOVU_APP_ID` is not set in Vercel Production**

## Quick Fix: Add Novu Environment Variable to Vercel

### Step 1: Get Your Novu App ID

From your Novu dashboard screenshot, your App ID is:
```
rPNktu-ZF0Xq
```

### Step 2: Add to Vercel

**Via Vercel Dashboard**:
1. Go to https://vercel.com/dashboard
2. Select your project  
3. Settings → Environment Variables
4. Click **Add New**
5. Add:
   ```
   Key: NEXT_PUBLIC_NOVU_APP_ID
   Value: rPNktu-ZF0Xq
   Environment: Production
   ```
6. Save

**Via CLI**:
```bash
vercel env add NEXT_PUBLIC_NOVU_APP_ID production
# When prompted, enter: rPNktu-ZF0Xq
```

### Step 3: Redeploy

After adding the environment variable:
1. Go to Deployments tab
2. Latest deployment → **...** → **Redeploy**
3. Wait 2-3 minutes

### Step 4: Test

Visit your app:
1. Log in
2. Look in header - Bell should appear! 🔔
3. Check browser console (F12):
   - Should see: `[NovuInbox] Init - Version: ...`
   - Should NOT see: `[NovuInbox] CRITICAL: Missing components`

## What You'll See

After fixing:
- 🔔 **Bell icon** in header (desktop and mobile)
- **Red badge** showing unseen notification count
- **Click bell** → Notification popup opens
- Notifications from your workflows (Issue Created, Comment Added, etc.)

## Verification

### Console Logs to Check:

**Good** (should see):
```
[NovuInbox] Init - Version: 2026-02-05-17-30-FIX-v3
```

**Bad** (should NOT see):
```
[NovuInbox] CRITICAL: Missing components or config
{
  hasAppId: false  // <-- This means env var is missing!
}
```

### Visual Check:

**Desktop Header** (right side):
```
[User Icon] [User Email] [Role Dropdown] [🔔Bell] [Logout Button]
```

**Mobile Header** (right side):
```
[🔔Bell] [☰ Menu]
```

## Current Novu Configuration

From VERCEL_ENV_KEYCLOAK.md, you already have these set:
- ✅ `NEXT_PUBLIC_NOVU_APP_ID=rPNktu-ZF0Xq`

If this is already in Vercel and bell still doesn't show, check:

1. **Is it in Production environment?**
   - Vercel has 3 environments: Production, Preview, Development
   - Make sure it's checked for **Production**

2. **Did you redeploy after adding?**
   - Environment variables only apply to NEW deployments
   - Must redeploy after adding env vars

## Novu Workflows Already Configured ✅

I can see from your screenshot you have these active workflows:
- Issue Updated (`issue-updated`)
- Issue Created (`issue-created`)  
- Comment Added (`comment-added`)
- Issue Status Changed (`issue-status-changed`)
- Issue Assigned (`issue-assigned`)

These will all trigger notifications once the bell is visible!

## Testing Notifications

After bell appears, test notifications:

1. **Create a new issue** → Should trigger "Issue Created" notification
2. **Add a comment** → Should trigger "Comment Added" notification
3. **Change issue status** → Should trigger "Issue Status Changed"
4. **Assign issue to user** → Should trigger "Issue Assigned"

The bell badge will show the number of unseen notifications.

## Summary

**Quick Steps**:
1. ✅ Verify `NEXT_PUBLIC_NOVU_APP_ID=rPNktu-ZF0Xq` is in Vercel Production
2. ✅ Redeploy on Vercel
3. ✅ Test - bell should appear
4. ✅ Click bell to see notifications

**Novu App ID**: `rPNktu-ZF0Xq`
