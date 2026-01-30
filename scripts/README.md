# Novu Workflow Setup Script

This script automatically creates all required Novu workflows for the OneSAAS Issue Tracker.

## Prerequisites

1. **Novu API Key**: Get from https://web.novu.co/ → Settings → API Keys (use Secret Key)
2. **Node.js**: Ensure Node.js is installed
3. **@novu/node package**: Installed in backend

## Quick Start

### Option 1: Direct Command

```bash
# From project root
node scripts/setup-novu-workflows.js YOUR_NOVU_API_KEY
```

### Option 2: Using Environment Variable

```bash
# Set environment variable
export NOVU_API_KEY=your_secret_key_here

# Run script
node scripts/setup-novu-workflows.js
```

### Option 3: From Backend Directory

```bash
cd apps/backend
node ../../scripts/setup-novu-workflows.js YOUR_NOVU_API_KEY
```

## What It Does

The script creates 4 workflows in your Novu account:

1. **issue-created** - New issue notifications
2. **comment-added** - Comment notifications  
3. **issue-status-changed** - Status update notifications
4. **issue-assigned** - Assignment notifications

Each workflow includes:
- ✅ In-App notification channel
- ✅ Proper message templates with variables
- ✅ "View Issue" action button
- ✅ Activated and ready to use

## Expected Output

```
🚀 Novu Workflow Setup Script
================================

📡 Connecting to Novu...
✅ Connected to Novu successfully!

🔍 Checking existing workflows...

📝 Creating workflow: Issue Created (issue-created)
✅ Successfully created: Issue Created
   ID: 65d7f03a6a6b2c0013a4b9c1
   Identifier: issue-created

📝 Creating workflow: Comment Added (comment-added)
✅ Successfully created: Comment Added
   ID: 65d7f03a6a6b2c0013a4b9c2
   Identifier: comment-added

... (continues for all 4 workflows)

================================
📊 Summary:
   Created: 4
   Skipped: 0
   Failed: 0
================================

✅ Workflow setup complete!
```

## Troubleshooting

### "Novu API Key is required"
**Cause**: No API key provided  
**Fix**: Pass API key as argument or set NOVU_API_KEY environment variable

### "Failed to connect to Novu"
**Cause**: Invalid API key  
**Fix**: 
1. Verify you're using **Secret Key** (not Application Identifier)
2. Copy key from Novu dashboard → Settings → API Keys

### "Workflow already exists"
**Cause**: Workflow with same identifier exists  
**Fix**: Script will skip existing workflows. To recreate:
1. Go to Novu dashboard
2. Delete existing workflow
3. Run script again

### "Cannot find module '@novu/node'"
**Cause**: Package not installed  
**Fix**: 
```bash
cd apps/backend
npm install
```

## After Running Script

1. **Verify in Novu Dashboard**
   - Go to https://web.novu.co/workflows
   - Check all 4 workflows are created and active

2. **Add API Key to Backend**
   ```env
   # apps/backend/.env
   NOVU_API_KEY=your_secret_key_here
   ```

3. **Test Locally**
   ```bash
   cd apps/backend
   npm run start:dev
   ```

4. **Deploy Backend**
   - Add NOVU_API_KEY to production environment
   - Deploy backend to hosting service

5. **Test Notifications**
   - Create an issue → Should trigger notification
   - Add a comment → Should trigger notification

## Script Features

- ✅ **Idempotent**: Safe to run multiple times (skips existing)
- ✅ **Error Handling**: Clear error messages
- ✅ **Validation**: Checks API key before proceeding
- ✅ **Summary**: Shows created/skipped/failed counts
- ✅ **Rate Limiting**: Built-in delays to avoid API limits

## Need Help?

If the script fails:
1. Check error messages carefully
2. Verify API key is correct (Secret Key, not App ID)
3. Ensure you have network connection
4. Check Novu service status at status.novu.co

Still having issues? The workflows can be created manually using `NOVU_WORKFLOW_SETUP.md`.
