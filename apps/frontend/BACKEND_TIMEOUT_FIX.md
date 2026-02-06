# Backend Connection Fix for Render Free Tier

## Problem Identified

Your backend is **configured correctly** and **working**! ✅

The issue is that your backend is on Render's **free tier**, which:
- ⏸️ **Spins down** after 15 minutes of inactivity
- ⏱️ **Takes 50+ seconds** to wake up on first request
- ⏰ **Frontend times out** after  15 seconds

When you log in:
1. Frontend tries to save user to backend
2. Backend is sleeping → takes 50 seconds to wake up
3. Frontend times out after 15 seconds
4. Error: "Failed to sync user with DB"

## The Fix

I've increased the frontend timeout from **15 seconds → 60 seconds** to handle Render cold starts.

### Code Change

**File**: `apps/frontend/src/context/AuthContext.tsx` (line 72)

**Before**:
```typescript
setTimeout(() => reject(new Error('Sync timeout')), 15000)  // 15s
```

**After**:
```typescript
setTimeout(() => reject(new Error('Sync timeout - backend may be sleeping (Render free tier)')), 60000)  // 60s
```

## What This Means

✅ **First login after inactivity**:
- May take 50-60 seconds (backend waking up)
- You'll see "Connecting to Authorization Server..." loading screen
- Will succeed once backend wakes up
- No error!

✅ **Subsequent logins** (if backend is awake):
- Fast (1-2 seconds)
- Normal experience

## Deployment Steps

### 1. Commit and Push

The code change has been made locally. Now:

```bash
git add apps/frontend/src/context/AuthContext.tsx
git commit -m "Fix: Increase backend timeout for Render cold starts"
git push origin main
```

### 2. Vercel Auto-Deploys

Vercel will automatically deploy the changes (2-3 minutes).

### 3. Test

After deployment:
1. Visit: https://frontend-three-brown-95.vercel.app
2. Click "Sign In"
3. Log in with Keycloak
4. **Wait up to 60 seconds** (if backend is sleeping)
5. Should succeed with no errors!

## Alternative Solutions

### Option A: Upgrade Render (Paid)
- $7/month for always-on backend
- No cold starts
- Faster experience

### Option B: Keep Backend Awake (Free but Hacky)
Use a ping service to hit your backend every 14 minutes:
- https://cron-job.org
- https://uptimerobot.com

Add a cron job:
```
*/14 * * * * curl https://onesaas-backend.onrender.com/health
```

### Option C: Accept the Delay (Free)
- Keep current fix
- First login takes ~60 seconds
- Subsequent logins are fast

## Verification

After deploying, check console logs:

**Should NOT see**:
```
Sync timeout
Failed to sync user with DB
```

**Should see** (on first login after inactivity):
```
[ApiDatabase] Fetching /users/by-email with Tenant: tenant1
DEBUG: Mapped Role: MEMBER
```

## Summary

- ✅ Backend is configured correctly
- ✅ Supabase credentials are correct
- ✅ Issue was frontend timeout vs. Render cold start
- ✅ Fix: Increased timeout to 60 seconds
- 📤 Action: Push changes to GitHub
- ⏰ Wait: 2-3 minutes for Vercel deployment
- 🧪 Test: Login should work (may take up to 60s first time)
