# 🚀 Vercel Deployment Guide - OneSAAS Issue Tracker

This guide will help you deploy the OneSAAS Issue Tracker frontend to Vercel in **Mock Mode** (no backend required).

---

## 📋 Prerequisites

- Vercel account (free tier works!)
- Git repository with your code
- 5 minutes of your time

---

## 🎯 Quick Start (Mock Mode - Recommended)

### Option 1: Deploy via Vercel Dashboard

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New" → "Project"**
3. **Import your Git repository**
4. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `.next` (or leave default)
   - **Install Command**: `npm ci` (or leave default)

5. **Environment Variables** (Click "Environment Variables"):
   - Add: `NEXT_PUBLIC_USE_MOCK` = `true`
   - Add: `NEXT_PUBLIC_APP_NAME` = `OneSAAS Issue Tracker`
   - Add: `NEXT_PUBLIC_NOVU_APP_ID` = `rPNktu-ZF0Xq` (optional for notifications)

6. **Click "Deploy"**
7. **Wait for deployment** (~2-3 minutes)
8. **Visit your app** at the provided URL (e.g., `https://your-app.vercel.app`)

---

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend directory
cd apps/frontend

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_USE_MOCK
# Enter: true

vercel env add NEXT_PUBLIC_APP_NAME
# Enter: OneSAAS Issue Tracker

# Deploy to production
vercel --prod
```

---

## 🔧 Environment Variables Explained

### For Mock Mode (Default)

| Variable | Value | Required | Description |
|----------|-------|----------|-------------|
| `NEXT_PUBLIC_USE_MOCK` | `true` | ✅ Recommended | Forces mock mode even if other vars are set |
| `NEXT_PUBLIC_APP_NAME` | `OneSAAS Issue Tracker` | ⭐ Optional | App name displayed in UI |
| `NEXT_PUBLIC_NOVU_APP_ID` | `rPNktu-ZF0Xq` | ⭐ Optional | For notifications (if enabled) |

**That's it!** With just these environment variables, your app will run in mock mode.

---

### For Production Mode (Advanced)

> [!WARNING]
> **Production mode requires:**
> - A deployed backend API (NestJS)
> - A deployed Keycloak server
> - A Supabase database
> 
> This is more complex and not recommended for initial deployment.

If you want to use production mode later, add these variables:

| Variable | Example Value | Required | Description |
|----------|---------------|----------|-------------|
| `NEXT_PUBLIC_KEYCLOAK_URL` | `https://keycloak.yourcompany.com` | ✅ | Keycloak server URL |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | `onesaas` | ✅ | Keycloak realm name |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | `issue-tracker` | ✅ | Keycloak client ID |
| `NEXT_PUBLIC_API_URL` | `https://api.yourcompany.com` | ✅ | Backend API URL |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | ✅ | Supabase anon key |

---

## ✅ Verifying Your Deployment

After deployment:

1. **Open your Vercel URL** (e.g., `https://your-app.vercel.app`)
2. **Check console logs** (F12 → Console):
   - Should see: `⚠️ [Mock Mode] Using MockAuthProvider...`
   - Should see: `⚠️ [Mock Mode] Using Mock Database...`
3. **Click "Login"**:
   - Should see login button
   - Click it to authenticate with mock user
4. **Navigate to Issues**:
   - Should be able to create/view issues
   - Data persists in browser localStorage

---

## 🐛 Troubleshooting

### Problem: "Authentication Error: Failed to fetch"

**Cause**: App is trying to connect to real Keycloak but environment variables are missing.

**Solution**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `NEXT_PUBLIC_USE_MOCK` = `true`
3. Redeploy (Deployments → Three dots → Redeploy)

---

### Problem: Build fails on Vercel

**Cause**: Missing dependencies or incorrect build command.

**Solution**:
1. Check `vercel.json` has correct settings:
   ```json
   {
     "framework": "nextjs",
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm ci"
   }
   ```
2. Ensure `package.json` has all required dependencies
3. Check build logs in Vercel dashboard for specific errors

---

### Problem: Blank page after deployment

**Cause**: Usually a client-side JavaScript error.

**Solution**:
1. Open browser console (F12)
2. Look for errors
3. Common issues:
   - Missing environment variables → Add `NEXT_PUBLIC_USE_MOCK=true`
   - Build errors → Check Vercel build logs

---

## 🔄 Updating Your Deployment

Every time you push to your Git repository:
- Vercel automatically rebuilds and redeploys
- No manual action needed!

To manually redeploy:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click three dots (⋮) on latest deployment
3. Click "Redeploy"

---

## 📂 Project Structure for Vercel

Your repository should look like this:

```
onesaas-issue-tracker/
├── apps/
│   └── frontend/           ← Root directory for Vercel
│       ├── src/
│       ├── package.json
│       ├── next.config.js
│       └── vercel.json     ← Vercel configuration
├── backend-reference/
└── ...
```

**Important**: Set **Root Directory** to `apps/frontend` in Vercel project settings.

---

## 🎨 Custom Domain (Optional)

To add a custom domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `issues.yourcompany.com`)
3. Follow DNS configuration instructions
4. Vercel automatically provisions SSL certificate

---

## 🔐 Environment Variable Best Practices

1. **Never commit `.env.local`** to Git (it's in `.gitignore`)
2. **Use Vercel Dashboard** to manage production environment variables
3. **Use `.env.example`** to document required variables
4. **For mock mode**: Only set `NEXT_PUBLIC_USE_MOCK=true`
5. **For production mode**: Set all required variables for Keycloak, API, and Supabase

---

## 📊 Monitoring

After deployment, monitor your app:

- **Vercel Analytics**: Dashboard → Analytics (free tier available)
- **Runtime Logs**: Dashboard → Your Project → Logs
- **Build Logs**: Dashboard → Your Project → Deployments → [deployment] → Building

---

## 🆘 Getting Help

If you encounter issues:

1. Check Vercel build logs
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Try redeploying after clearing build cache

---

## 🚀 Next Steps

After successful deployment in mock mode:

1. ✅ Test all features (login, create issues, etc.)
2. ✅ Share your Vercel URL with team
3. ⭐ (Optional) Set up custom domain
4. ⭐ (Later) Upgrade to production mode with real backend

---

**Congratulations! 🎉** Your OneSAAS Issue Tracker is now live on Vercel!
