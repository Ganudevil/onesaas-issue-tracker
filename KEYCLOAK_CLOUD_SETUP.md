# ☁️ Setup Guide: Free Keycloak on Cloud-IAM

This guide shows you how to get a **Real, Public Keycloak** instance for free using [Cloud-IAM](https://www.cloud-iam.com/), so your Vercel app can use real authentication instead of Mock Mode.

## Phase 1: Create Free Account
1. Go to **[Cloud-IAM Register Page](https://www.cloud-iam.com/)**.
2. Sign up with email/GitHub.
3. In the dashboard, click **"Create New Deployment"**.
4. Select the **"Little Lemur"** plan (Free Forever).
   - *Note: It might ask for a region. Choose one close to you (e.g., US-East, EU-West).*
5. Wait ~2 minutes for the instance to be provisioned.

## Phase 2: Get Credentials
Once your instance is ready (Green "Running" status):
1. Click on your deployment details.
2. Copy your **Keycloak URL** (e.g., `https://lemur-1234.cloud-iam.com/auth`).
3. Note the **Admin Username** and **Password** provided in the dashboard.

## Phase 3: Configure Keycloak (Online)
1. Open your Keycloak URL in a new tab.
2. Login to the **Administration Console** with the credentials from Phase 2.
3. **Create Realm**:
   - Hover over "Master" (top left) -> Click **"Create Realm"**.
   - Name: `onesaas`
   - Click **Create**.
4. **Create Client**:
   - Go to **Clients** (left menu) -> **Create Client**.
   - Client ID: `onesaas-frontend`
   - Click **Next**.
   - **Capability Config**: Ensure "Standard Flow" is checked.
   - Click **Next**.
   - **Login Settings**:
     - Root URL: `https://your-vercel-app.vercel.app/` (Replace with your ACTUAL Vercel domain)
     - Valid Redirect URIs: `https://your-vercel-app.vercel.app/*`
     - Web Origins: `+`
   - Click **Save**.
5. **Create Test User**:
   - Go to **Users** (left menu) -> **Add user**.
   - Username: `testuser`
   - Click **Create**.
   - Go to **Credentials** tab -> **Set Password**.
   - Password: `123` (Turn OFF "Temporary").

## Phase 4: Connect Vercel
1. Go to your **Vercel Dashboard**.
2. Select your project (`onesaas-issue-tracker`).
3. Go to **Settings** -> **Environment Variables**.
4. **Edit** (or Add) these variables:
   - `NEXT_PUBLIC_KEYCLOAK_URL`: `https://lemur-xxxx.cloud-iam.com/auth` (Your new Cloud-IAM URL)
   - `NEXT_PUBLIC_KEYCLOAK_REALM`: `onesaas`
   - `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID`: `onesaas-frontend`
   - `NEXT_PUBLIC_USE_MOCK`: `false` (IMPORTANT: Turn off mock mode!)
5. **Redeploy**:
   - Go to **Deployments** tab.
   - Click the three dots on the latest deployment -> **Redeploy**.

## Phase 5: Verify
1. Open your Vercel App URL.
2. Click Login.
3. You should see the Cloud-IAM login page (not localhost, not mock).
4. Login with `testuser` / `123`.
