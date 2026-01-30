# Novu Workflow Setup Guide

Follow these steps to configure your Novu workflows in the dashboard.

---

## Workflow 1: Issue Created

### Basic Information
- **Workflow Identifier**: `issue-created`
- **Workflow Name**: "New Issue Created"
- **Description**: "Notify users when a new issue is created"

### Steps to Create:

1. **Go to Workflows**
   - Navigate to https://web.novu.co/
   - Click "Workflows" in the left sidebar
   - Click "Create Workflow" button

2. **Set Identifier**
   - Enter identifier: `issue-created`
   - Enter name: "New Issue Created"
   - Click "Create"

3. **Add In-App Channel**
   - Click "+ Add Step"
   - Select "In-App"
   - Configure the step:

**Message Template**:
```
🆕 New Issue: {{title}}

Priority: {{priority}}
Issue ID: {{issueId}}
```

**Action (Optional)**:
- Label: "View Issue"
- URL: `{{url}}/issues/{{issueId}}`

4. **Activate Workflow**
   - Toggle "Active" in top right
   - Save changes

---

## Workflow 2: Comment Added

### Basic Information
- **Workflow Identifier**: `comment-added`
- **Workflow Name**: "New Comment on Issue"
- **Description**: "Notify users when a comment is added to an issue"

### Steps to Create:

1. **Create New Workflow**
   - Identifier: `comment-added`
   - Name: "New Comment on Issue"

2. **Add In-App Step**

**Message Template**:
```
💬 New comment on "{{issueTitle}}"

{{comment}}

Issue ID: {{issueId}}
```

**Action**:
- Label: "View Issue"
- URL: `{{url}}/issues/{{issueId}}`

3. **Activate Workflow**

---

## Workflow 3: Issue Status Changed

### Basic Information
- **Workflow Identifier**: `issue-status-changed`
- **Workflow Name**: "Issue Status Updated"
- **Description**: "Notify users when issue status changes"

### Steps to Create:

1. **Create New Workflow**
   - Identifier: `issue-status-changed`
   - Name: "Issue Status Updated"

2. **Add In-App Step**

**Message Template**:
```
🔄 Status changed: {{title}}

New status: {{status}}
Issue ID: {{issueId}}
```

**Action**:
- Label: "View Issue"
- URL: `{{url}}/issues/{{issueId}}`

3. **Activate Workflow**

---

## Workflow 4: Issue Assigned

### Basic Information
- **Workflow Identifier**: `issue-assigned`
- **Workflow Name**: "Issue Assigned to You"
- **Description**: "Notify users when they are assigned to an issue"

### Steps to Create:

1. **Create New Workflow**
   - Identifier: `issue-assigned`
   - Name: "Issue Assigned to You"

2. **Add In-App Step**

**Message Template**:
```
👤 You were assigned: {{title}}

Issue ID: {{issueId}}
Click to view and start working!
```

**Action**:
- Label: "View Issue"
- URL: `{{url}}/issues/{{issueId}}`

3. **Activate Workflow**

---

## Payload Variables Reference

Each workflow receives these variables from the backend:

### issue-created
```json
{
  "issueId": "uuid-string",
  "title": "Issue title",
  "priority": "high|medium|low",
  "url": "https://your-frontend-url.com"
}
```

### comment-added
```json
{
  "issueId": "uuid-string",
  "issueTitle": "Issue title",
  "comment": "Comment text content"
}
```

### issue-status-changed
```json
{
  "issueId": "uuid-string",
  "title": "Issue title",
  "status": "open|in_progress|resolved|closed"
}
```

### issue-assigned
```json
{
  "issueId": "uuid-string",
  "title": "Issue title"
}
```

---

## Verification Checklist

After creating all workflows:

- [ ] Workflow `issue-created` is created and active
- [ ] Workflow `comment-added` is created and active
- [ ] Workflow `issue-status-changed` is created and active
- [ ] Workflow `issue-assigned` is created and active
- [ ] All workflows have In-App channel configured
- [ ] All workflows have message templates with variables
- [ ] All identifiers match exactly (case-sensitive)

---

## Common Issues

### Workflow Not Triggering

**Problem**: Notification not appearing in frontend  
**Solutions**:
1. Verify workflow identifier matches exactly
2. Check backend logs for Novu trigger events
3. Ensure workflow is activated (toggle in top right)
4. Verify NOVU_API_KEY is set in backend environment

### Variables Not Showing

**Problem**: `{{variable}}` appears as text instead of value  
**Solutions**:
1. Check variable names match payload exactly
2. Ensure variables are wrapped in double curly braces
3. Variable names are case-sensitive

### Subscriber Not Found

**Problem**: Error about subscriber not existing  
**Solutions**:
1. Backend automatically creates subscriber on first trigger
2. Ensure user ID is passed correctly to NovuService
3. Check Novu dashboard → Subscribers to see if user exists

---

## Testing Your Workflows

After setup, test each workflow:

1. **Start Backend**: `cd apps/backend && npm run start:dev`
2. **Create Issue**: Should trigger `issue-created`
3. **Add Comment**: Should trigger `comment-added`
4. **Change Status**: Should trigger `issue-status-changed`
5. **Assign Issue**: Should trigger `issue-assigned`

Check:
- Backend logs show "Successfully triggered Novu event"
- Novu bell icon in frontend shows new notification
- Clicking notification navigates to correct issue

---

## Next Steps

1. ✅ Complete all 4 workflow setups
2. ✅ Get your Novu Secret API Key
3. ✅ Add API key to backend .env
4. ✅ Deploy backend with environment variable
5. ✅ Test notifications end-to-end
