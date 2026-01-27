# 🚀 Vercel Deployment Guide - Quick Start

Deploy both frontend and backend to Vercel (100% FREE!)

---

## ⚡ Quick Deploy (5 Minutes)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will open a browser window. Sign in with:
- GitHub account
- GitLab account  
- Email

---

## 🎨 Deploy Frontend

```bash
# Navigate to frontend
cd f:\onesaas-issue-tracker-v.g1\apps\frontend

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? onesaas-frontend
# - Directory? ./

# Deploy to production
vercel --prod
```

✅ **Frontend URL**: Copy the URL (e.g., `https://onesaas-frontend.vercel.app`)

---

## 🔧 Deploy Backend

```bash
# Navigate to backend
cd f:\onesaas-issue-tracker-v.g1\backend-reference

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? onesaas-backend
# - Directory? ./

# Deploy to production
vercel --prod
```

✅ **Backend URL**: Copy the URL (e.g., `https://onesaas-backend.vercel.app`)

---

## 🔐 Set Environment Variables

### For Backend:

Go to [Vercel Dashboard](https://vercel.com/dashboard) → Select **onesaas-backend** → **Settings** → **Environment Variables**

Add these variables:

| Variable | Value | Example |
|----------|-------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase anon key | `eyJxxx...` |
| `JWT_SECRET` | Random secret string | `my-super-secret-key-123` |
| `KEYCLOAK_URL` | Keycloak server URL | `http://localhost:8080` |
| `KEYCLOAK_REALM` | Keycloak realm | `onesaas` |
| `PORT` | Port number | `3000` |

After adding variables, redeploy:

```bash
cd backend-reference
vercel --prod
```

### For Frontend:

Go to [Vercel Dashboard](https://vercel.com/dashboard) → Select **onesaas-frontend** → **Settings** → **Environment Variables**

Add these variables (must be prefixed with `VITE_`):

| Variable | Value | Example |
|----------|-------|---------|
| `VITE_API_URL` | Backend URL from above | `https://onesaas-backend.vercel.app` |
| `VITE_KEYCLOAK_URL` | Keycloak URL | `http://localhost:8080` |
| `VITE_KEYCLOAK_REALM` | Keycloak realm | `onesaas` |
| `VITE_KEYCLOAK_CLIENT_ID` | Client ID | `issue-tracker-client` |

After adding variables, redeploy:

```bash
cd apps/frontend
vercel --prod
```

---

## 🔗 Connect Frontend to Backend

Update your frontend environment to use the production backend:

### Option 1: Via Vercel Dashboard
1. Go to frontend project settings
2. Update `VITE_API_URL` to your backend URL
3. Redeploy

### Option 2: Via CLI
```bash
cd apps/frontend
vercel env add VITE_API_URL production
# Paste your backend URL when prompted
vercel --prod
```

---

## 📊 Verify Deployment

### Check Frontend:
```bash
# Open in browser
start https://onesaas-frontend.vercel.app
```

### Check Backend API:
```bash
# Test backend health
curl https://onesaas-backend.vercel.app/api/health
```

Or open in browser: `https://onesaas-backend.vercel.app/api`

---

## 🎯 GitLab CI/CD Integration

### Get Vercel Token

1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: `GitLab CI/CD`
4. Scope: Full Account
5. Copy the token

### Add to GitLab

1. Go to https://gitlab.com/Ganudevil/onesaas-issue-tracker/-/settings/ci_cd
2. **Variables** → **Add variable**
3. **Key**: `VERCEL_TOKEN`
4. **Value**: Paste your token
5. ✅ Check **Protect variable**
6. ✅ Check **Mask variable**
7. Click **Add variable**

Now every push to `main` will:
- ✅ Build frontend and backend
- 🔵 Ready to deploy (click "Play" in pipeline)

---

## 🔄 Redeploy After Changes

After making code changes:

```bash
# Commit changes
git add .
git commit -m "Your changes"
git push gitlab main

# Or manually deploy
cd apps/frontend
vercel --prod

cd ../backend-reference
vercel --prod
```

---

## 🆓 Vercel Free Tier Limits

✅ **Included in Free Tier:**
- 100GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Global CDN
- Serverless Functions (100GB-hours)

⚠️ **Limits:**
- 10 second serverless function timeout
- 4.5GB compressed output
- 32 max concurrent builds

Your app should fit comfortably in the free tier! 🎉

---

## 📝 Common Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Remove deployment
vercel rm [deployment-name]

# Link project
vercel link

# Pull environment variables locally
vercel env pull
```

---

## 🐛 Troubleshooting

### Build fails on Vercel

**Issue**: `Error: Build failed`
- Check build logs in Vercel dashboard
- Ensure `package.json` has correct build script
- Check Node.js version compatibility

### Backend returns 404

**Issue**: API routes not working
- Check `vercel.json` routes configuration
- Ensure `dist/main.js` exists after build
- Verify build output directory

### Frontend can't connect to backend

**Issue**: CORS errors
- Add frontend URL to backend CORS configuration
- Update `VITE_API_URL` to production backend URL
- Check browser console for exact error

### Environment variables not loading

**Issue**: Variables showing as `undefined`
- Frontend: Ensure variables are prefixed with `VITE_`
- Backend: Check Vercel project settings
- Redeploy after adding variables

---

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Your Frontend](https://onesaas-frontend.vercel.app) (after deployment)
- [Your Backend](https://onesaas-backend.vercel.app) (after deployment)

---

**You're all set! Both frontend and backend will be live on Vercel! 🚀**

Total cost: **$0/month** 💰
