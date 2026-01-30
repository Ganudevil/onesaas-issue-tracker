# Novu Notifications - Vercel Configuration

## Environment Variable Required

To enable Novu notifications on Vercel, add the following environment variable:

**Variable Name**: `NEXT_PUBLIC_NOVU_APP_ID`  
**Variable Value**: `rPNktu-ZF0Xq`

## How to Add to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Name**: `NEXT_PUBLIC_NOVU_APP_ID`
   - **Value**: `rPNktu-ZF0Xq`
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**
7. **Redeploy** your application (Deployments → ⋮ → Redeploy)

## What This Enables

✅ **Notification Bell** appears in the Navbar  
✅ **Notification Center** dropdown with badge counter  
✅ **Click notifications** to navigate to related issues  
✅ **Mark all as read** and **Clear all** functionality  

## Notes

- The notification center will be empty until notifications are sent via Novu's backend API
- For testing, you can send notifications manually via [Novu Dashboard](https://web.novu.co/)
- The subscriber ID is the authenticated user's ID from the app

## Troubleshooting

**Bell icon not showing:**
- Verify `NEXT_PUBLIC_NOVU_APP_ID` is set in Vercel
- Check browser console for warnings
- Ensure you're logged in to the application

**Empty notification center:**
- This is expected if no notifications have been sent
- Notifications must be triggered by a backend service or manually via Novu dashboard
