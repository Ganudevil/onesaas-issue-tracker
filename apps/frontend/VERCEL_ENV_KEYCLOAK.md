# Vercel Environment Variables - Keycloak Production Mode

## Copy-Paste Template for Vercel

Use this exact configuration in your Vercel project:

### Environment Variables to Add

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add each of these (select **Production** environment):

```
NEXT_PUBLIC_AUTH_MODE=keycloak
```

```
NEXT_PUBLIC_KEYCLOAK_URL=https://lemur-9.cloud-iam.com/auth
```

```
NEXT_PUBLIC_KEYCLOAK_REALM=onesaas-auth
```

```
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=<FIND_THIS_IN_KEYCLOAK_ADMIN>
```

```
NEXT_PUBLIC_NOVU_APP_ID=rPNktu-ZF0Xq
```

---

## How to Find Your Client ID

### Option 1: From Keycloak Admin Panel
1. Go to Keycloak Admin: https://lemur-9.cloud-iam.com/auth/admin
2. Select realm: `onesaas-auth`
3. Click **Clients** in left sidebar
4. Find your client in the list
5. Click on it
6. Look for the **"Client ID"** field in General Settings (at the top)

### Option 2: Common Client IDs
Try one of these common patterns:
- `onesaas-auth`
- `issue-tracker`
- `frontend`
- `onesaas-frontend`
- `issue-tracker-client`

---

## Quick Setup via Vercel CLI

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login
vercel login

# Link to your project
cd apps/frontend
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_AUTH_MODE production
# Enter: keycloak

vercel env add NEXT_PUBLIC_KEYCLOAK_URL production
# Enter: https://lemur-9.cloud-iam.com/auth

vercel env add NEXT_PUBLIC_KEYCLOAK_REALM production
# Enter: onesaas-auth

vercel env add NEXT_PUBLIC_KEYCLOAK_CLIENT_ID production
# Enter: <your-client-id>

vercel env add NEXT_PUBLIC_NOVU_APP_ID production
# Enter: rPNktu-ZF0Xq

# Redeploy to production
vercel --prod
```

---

## After Adding Variables

1. **Redeploy** is REQUIRED for env vars to take effect
   - Auto-redeploy may trigger, or
   - Manually redeploy: Deployments → Latest → ⋯ → Redeploy

2. **Wait** 2-3 minutes for deployment to complete

3. **Test** the login:
   - Visit: https://frontend-three-brown-95.vercel.app
   - Click "Sign In"
   - Should redirect to Keycloak login
   - Enter your Keycloak credentials
   - Should redirect back to app

---

## Verification Checklist

After redeployment, verify:

- [ ] Page loads without errors
- [ ] Console shows: `effectiveShouldUseMock: false`
- [ ] Console shows: `authMode: "keycloak"`
- [ ] Clicking "Sign In" redirects to Keycloak
- [ ] Can log in with Keycloak credentials
- [ ] Redirects back to app after login
- [ ] Notification bell appears after login
- [ ] No CORS errors in console

---

## Troubleshooting

### ❌ "Invalid redirect_uri"
- Check Keycloak client has: `https://frontend-three-brown-95.vercel.app/*` in Valid Redirect URIs

### ❌ CORS errors
- Add to Web Origins in Keycloak: `https://frontend-three-brown-95.vercel.app`

### ❌ "Client not found"
- Double-check `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` is correct

### ❌ Still shows mock mode
- Verify environment variables are set in **Production** environment
- Verify you redeployed after adding variables
- Check browser console for the authMode value

---

## Test User

If you need to create a test user in Keycloak:

1. Keycloak Admin → Users → Add user
2. Username: `testuser`
3. Email: `test@onesaas.com`
4. Email Verified: ON
5. Save
6. Go to Credentials tab
7. Set password (Temporary: OFF)
8. Save

Login with: `testuser` / `<your-password>`
