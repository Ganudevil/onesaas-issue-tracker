# Novu Production Workflow Setup Required

## ⚠️ CRITICAL: Workflows Not Set Up in Production

The notification bell is working, but **no workflows are configured in Production**.

You need to **manually create** the workflows in Novu Production environment.

---

## Steps to Create Workflows

### Go to Novu Dashboard → Production Environment

1. **Click "Workflows"** in left sidebar
2. **Create 5 workflows** with these exact settings:

---

### Workflow 1: Issue Created

**Trigger Identifier**: `issue-created` (EXACT - must match code!)

**Steps**:
1. Add **In-App** notification step
   - **Body**: `New issue created: {{payload.title}}`
   
2. (Optional) Add **Email** step
   - **Subject**: `New Issue: {{payload.title}}`
   - **Body**:
     ```text
     Hi {{subscriber.firstName}},

     A new issue has been created: "{{payload.title}}"
     
     "{{payload.description}}"
     
     <a href="{{payload.url}}/issues/{{payload.issueId}}">View Issue</a>
     ```

**Click "Publish"** ✅

---

### Workflow 2: Issue Assigned

**Trigger Identifier**: `issue-assigned`

**Steps**:
1. Add **In-App** notification
   - **Body**: `You were assigned to: {{payload.title}}`

**Click "Publish"** ✅

---

### Workflow 3: Issue Status Changed

**Trigger Identifier**: `issue-status-changed`

**Steps**:
1. Add **In-App** notification
   - **Body**: `Issue "{{payload.title}}" status changed to {{payload.status}}`

**Click "Publish"** ✅

---

### Workflow 4: Comment Added

**Trigger Identifier**: `comment-added`

**Steps**:
1. Add **In-App** notification
   - **Body**: `New comment on "{{payload.issueTitle}}": {{payload.comment}}`

**Click "Publish"** ✅

---

### Workflow 5: Issue Updated

**Trigger Identifier**: `issue-updated`

**Steps**:
1. Add **In-App** notification
   - **Body**: `Issue "{{payload.title}}" was updated: {{payload.changeType}}`

**Click "Publish"** ✅

---

## Verification

After creating all 5 workflows:

1. **Go to Workflows** in Novu dashboard
2. **Verify** all 5 are Published (Active)
3. **Check** Trigger Identifiers match exactly:
   - `issue-created`
   - `issue-assigned`
   - `issue-status-changed`
   - `comment-added`
   - `issue-updated`

---

## Then Test

1. **Create a new issue** in your app
2. **Bell should show "1"** notification
3. **Click bell** → See notification
4. **Click gear icon** → See "Clear All" button ✅

---

## Why This Is Needed

The backend code is **already triggering** these workflows, but Novu returns errors if the workflows don't exist in Production.

You **must** create them manually in the Novu dashboard - they can't be created automatically.
