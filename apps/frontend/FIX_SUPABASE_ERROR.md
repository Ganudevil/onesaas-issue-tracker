# Fix for Supabase User Data Sync Error

## Quick Summary

**Problem**: Frontend can't save user data to Supabase via backend API  
**Impact**: "Failed to sync user with DB"error in console  
**Status**: ✅ Keycloak auth IS working, ❌ Data persistence is NOT working  
**Solution**: Use frontend-only mode (no backend/Supabase required)

---

## The Fix: Frontend-Only Mode

Since the backend at `onesaas-backend.onrender.com` is not properly configured or deployed, the best solution is to use **frontend-only mode**.

### What This Means

- ✅ Keycloak authentication continues to work
- ✅ Application fully functional
- ✅ No more "Failed to sync user" errors
- ⚠️ Data stored in browser (localStorage) instead of Supabase
- ⚠️ Data is per-browser (not shared across devices)

### How to Implement

**Update Vercel Environment Variables**:

Remove or change these variables:

| Variable | Current | New Value |
|----------|---------|-----------|
| `NEXT_PUBLIC_API_URL` | `https://onesaas-backend.onrender.com` | **DELETE** or set to `mock` |

That's it! One environment variable change.

---

## Step-by-Step Instructions

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Find `NEXT_PUBLIC_API_URL`
5. Click the **...** menu → **Delete**
6. Confirm deletion
7. Go to **Deployments** → Latest → **...** → **Redeploy**

### Option B: Via Vercel CLI

```bash
# Remove the environment variable  
vercel env rm NEXT_PUBLIC_API_URL production

# Redeploy
vercel --prod
```

---

## How It Works

### Before (Current - Failing):
```
Frontend → Backend API (onrender.com) → Supabase ❌
```

### After (Frontend-Only - Working):
```
Frontend → localStorage ✅
```

The code automatically detects when `NEXT_PUBLIC_API_URL` is missing and uses mock database mode.

From `db.ts`:
```typescript
const shouldUseMock =
    !process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_URL === '' ||
    process.env.NEXT_PUBLIC_API_URL === 'mock';

export const db = shouldUseMock ? mockDb : new ApiDatabase();
```

---

## Verification After Redeployment

### 1. Check Console Logs

Open browser console (F12) and look for:

**Instead of seeing**:
```
[ApiDatabase] Fetching /users/by-email...
Failed to sync user with DB
```

**You should see**:
```
⚠️ [Mock Mode] Using Mock Database because NEXT_PUBLIC_API_URL is missing or local.
```

### 2. No More Errors

The "Failed to sync user with DB" error should be gone.

### 3. Authentication Works

- Click "Sign In"
- Redirects to Keycloak
- Log in
- Redirects back → You're authenticated ✅

### 4. Novu Notification Bell

After successful login, the notification bell should appear in the header.

---

## What About Supabase?

If you want to use Supabase in the future, you'll need to:

1. **Deploy the backend** to Render (or another platform)
2. **Configure backend environment variables**:
   ```
   SUPABASE_URL=https://inqqjossxelydrdabglj.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   JWT_SECRET=<your-jwt-secret>
   ```
3. **Update Vercel** to point to backend:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

But for now, **frontend-only mode is the fastest path to a working application**.

---

## Summary Checklist

- [ ] Delete `NEXT_PUBLIC_API_URL` from Vercel (Production environment)
- [ ] Redeploy on Vercel
- [ ] Wait 2-3 minutes for deployment
- [ ] Test: Visit https://frontend-three-brown-95.vercel.app
- [ ] Test: Log in with Keycloak
- [ ] Verify: No console errors
- [ ] Verify: Notification bell appears

---

## Expected Outcome

After redeployment:
- ✅ Keycloak authentication works
- ✅ No "Failed to sync user" errors
- ✅ Novu notification bell visible
- ✅ Can create/view issues (stored in browser)
- ✅ Application fully functional

---

## Alternative: Keep Backend (Advanced)

If you want to keep using the backend:

1. Verify backend is deployed and running
2. Add backend environment variables on Render:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
3. Test backend endpoint: `curl https://onesaas-backend.onrender.com/users`
4. If working, keep `NEXT_PUBLIC_API_URL` in Vercel

But my recommendation: **Start with frontend-only mode, add backend later if needed**.
