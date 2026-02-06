# Switch to Production Novu - Complete Guide

## Issues Fixed ✅

### 1. Import Errors
**Problem**: Vercel build failing with:
```
Attempted import error: '@novu/notification-center' does not contain a default export
```

**Root Cause**: Using namespace import with fallback logic
```typescript
// OLD (causing errors)
import * as NovuNotificationCenter from '@novu/notification-center';
const NovuProvider = NovuNotificationCenter.NovuProvider || ...
```

**Solution**: Direct named imports
```typescript
// NEW (works!)
import { NovuProvider, PopoverNotificationCenter } from '@novu/notification-center';
```

### 2. Wrong Environment
**Problem**: Using Development App ID (`rPNktu-ZF0Xq`)  
**Solution**: Switch to Production App ID (`Ixc7z98Hcs8E`)

---

## Code Changes Made ✅

**File**: `src/components/NovuInbox.tsx`

### Change 1: Fixed Imports (Lines 1-5)
```typescript
// BEFORE
import * as NovuNotificationCenter from '@novu/notification-center';
const NovuProvider = NovuNotificationCenter.NovuProvider ||
    (NovuNotificationCenter as any).default?.NovuProvider;
const PopoverNotificationCenter = NovuNotificationCenter.PopoverNotificationCenter ||
    (NovuNotificationCenter as any).default?.PopoverNotificationCenter;

// AFTER
import { NovuProvider, PopoverNotificationCenter } from '@novu/notification-center';
```

### Change 2: Simplified Safety Checks (Lines 12-27)
```typescript
// BEFORE
if (!NovuProvider || !PopoverNotificationCenter || !userId || !appId) {
    console.error('[NovuInbox] CRITICAL: Missing components or config', {
        hasNovuProvider: !!NovuProvider,
        hasPopover: !!PopoverNotificationCenter,
        hasUserId: !!userId,
        hasAppId: !!appId,
        novLibKeys: Object.keys(NovuNotificationCenter),
        timestamp: DEPLOY_TIMESTAMP
    });
    return null;
}

// AFTER  
if (!userId || !appId) {
    console.error('[NovuInbox] CRITICAL: Missing config', {
        hasUserId: !!userId,
        hasAppId: !!appId,
        appId: appId,
        timestamp: DEPLOY_TIMESTAMP
    });
    return null;
}
```

### Change 3: Updated Telemetry Version
```typescript
const DEPLOY_TIMESTAMP = '2026-02-06-PRODUCTION-NOVU';
```

---

## Update Vercel Environment Variable

### Production App ID

From your Novu Production dashboard:
```
Application Identifier: Ixc7z98Hcs8E
```

### Steps to Update

**Method 1: Vercel Dashboard** (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Find `NEXT_PUBLIC_NOVU_APP_ID`
5. Click **Edit** (pencil icon)
6. **Old Value**: `rPNktu-ZF0Xq` (Development)
7. **New Value**: `Ixc7z98Hcs8E` (Production)
8. Click **Save**

**Method 2: Delete and Re-add**
1. Find `NEXT_PUBLIC_NOVU_APP_ID`
2. Click **...** → **Delete**
3. Click **Add New**
4. Name: `NEXT_PUBLIC_NOVU_APP_ID`
5. Value: `Ixc7z98Hcs8E`
6. Environment: **Production** ✅
7. Click **Save**

**Method 3: Vercel CLI**
```bash
# Remove old
vercel env rm NEXT_PUBLIC_NOVU_APP_ID production

# Add new
vercel env add NEXT_PUBLIC_NOVU_APP_ID production
# When prompted, enter: Ixc7z98Hcs8E
```

---

## Deployment Steps

### 1. Verify Changes Pushed ✅
Changes have been committed to GitHub.

### 2. Update Vercel Environment Variable
Use one of the methods above to change:
- **From**: `rPNktu-ZF0Xq` (Development)
- **To**: `Ixc7z98Hcs8E` (Production)

### 3. Redeploy on Vercel
After updating the environment variable:
1. Go to **Deployments** tab
2. Click latest deployment
3. Click **...** → **Redeploy**
4. Wait 2-3 minutes

### 4. Test
1. Visit https://frontend-three-brown-95.vercel.app
2. Log in with Keycloak
3. Look for notification bell 🔔 in header
4. Check browser console (F12)

---

## Verification Checklist

### ✅ Build Should Succeed
No more errors like:
```
Attempted import error: '@novu/notification-center' does not contain a default export
```

### ✅ Console Logs
**Should see**:
```
[NovuInbox] Init - Version: 2026-02-06-PRODUCTION-NOVU
```

**Should NOT see**:
```
[NovuInbox] CRITICAL: Missing config
```

### ✅ Visual Check
- Bell icon appears in header
- Red badge shows unseen count  
- Click bell → Notification popup opens

### ✅ Novu Production Workflows
Your Production workflows should be active:
- Issue Created
- Issue Updated
- Comment Added
- Issue Status Changed
- Issue Assigned

---

## What Changed?

### Fixed:
1. ✅ Import errors (namespace → named imports)
2. ✅ Build failures on Vercel
3. ✅ Simplified component logic

### User Action Required:
1. Update Vercel env var to Production App ID
2. Redeploy

### Expected Result:
- ✅ Build succeeds
- ✅ Notification bell appears
- ✅ Production workflows active
- ✅ Notifications work

---

## Production vs Development

| Aspect | Development | Production |
|--------|------------|-----------|
| App ID | `rPNktu-ZF0Xq` | `Ixc7z98Hcs8E` |
| Environment | Development | Production |
| Workflows | Dev workflows | Prod workflows |
| Use Case | Testing | Live app |

---

## Troubleshooting

### Build Still Failing?
- Check the import statement is exactly: `import { NovuProvider, PopoverNotificationCenter } from '@novu/notification-center';`
- Verify no stale cache - try **Clear cache and redeploy** in Vercel

### Bell Still Not Appearing?
1. Check console for `[NovuInbox] CRITICAL`
2. Verify `NEXT_PUBLIC_NOVU_APP_ID` is set correctly
3. Ensure you redeployed AFTER updating env var

### Wrong Workflows Showing?
- Verify you're using Production App ID (`Ixc7z98Hcs8E`)
- Check Novu dashboard is in Production environment

---

## Summary

### Code Changes (Already Pushed ✅):
- Fixed imports in `NovuInbox.tsx`
- Removed namespace import fallback logic
- Simplified safety checks
- Updated telemetry version

### User Actions Required:
1. **Update** Vercel env var: `NEXT_PUBLIC_NOVU_APP_ID` = `Ixc7z98Hcs8E`
2. **Redeploy** on Vercel
3. **Test** notification bell

### Expected Outcome:
- ✅ Build succeeds (no import errors)
- ✅ App uses Production Novu
- ✅ Notification bell appears
- ✅ Production workflows active
