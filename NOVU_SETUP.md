# Novu Setup Guide

This guide explains how to set up the notification workflows in the [Novu Dashboard](https://web.novu.co/) to match the OneSAAS backend integration.

## Prerequisites
1.  **Account**: You need a [Novu](https://novu.co) account.
2.  **API Key**: Get your API Key from **Settings -> API Keys** and add it to `backend-reference/.env`.

## Required Workflows
You need to create **4 Workflows** with specific "Trigger Identifiers".

### 1. Issue Created
*Used when a new issue is created.*

1.  Go to **Workflows** -> **Add a Workflow**.
2.  **Name**: `Issue Created`
3.  **Trigger Identifier**: `issue-created` (Must match exactly!)
4.  **Steps**: Add an **Email** step (or In-App).
    *   **Subject**: `New Issue Created: {{payload.title}}`
    *   **Body**:
        ```text
        Hi {{subscriber.firstName}},

        A new issue has been created: "{{payload.title}}".
        
        <a href="{{payload.url}}/issues/{{payload.issueId}}">View Issue</a>
        ```
    *   *(Note: The backend sends `title` and `issueId`. You can construct the URL.)*
5.  **Save** and **Activate** (Publish).

### 2. Issue Status Changed
*Used when an issue is moved in Kanban (e.g., Todo -> Done).*

1.  **Add a Workflow**.
2.  **Name**: `Issue Status Changed`
3.  **Trigger Identifier**: `issue-status-changed`
4.  **Steps**: Add **In-App** or **Email**.
    *   **Subject**: `Status Updated: {{payload.title}}`
    *   **Body**:
        ```text
        The status of issue "{{payload.title}}" has changed to "{{payload.status}}".
        ```
5.  **Save** and **Activate**.

### 3. Issue Assigned
*Used when an issue is assigned to a user.*

1.  **Add a Workflow**.
2.  **Name**: `Issue Assigned`
3.  **Trigger Identifier**: `issue-assigned`
4.  **Steps**: Add **Email**.
    *   **Subject**: `You have been assigned: {{payload.title}}`
    *   **Body**:
        ```text
        You have been assigned to the issue "{{payload.title}}".
        
        Please review it here: <a href="{{payload.url}}/issues/{{payload.issueId}}">View Issue</a>
        ```
5.  **Save** and **Activate**.

### 4. Comment Added
*Used when someone comments on an issue.*

1.  **Add a Workflow**.
2.  **Name**: `Comment Added`
3.  **Trigger Identifier**: `comment-added`
4.  **Steps**: Add **In-App** and **Email**.
    *   **Subject**: `New Comment on {{payload.issueTitle}}`
    *   **Body**:
        ```text
        New comment on issue "{{payload.issueTitle}}":
        
        "{{payload.comment}}"
        ```
5.  **Save** and **Activate**.

## Testing
Once created, the backend will trigger these using the installed SDK.
Ensure your `NOVU_API_KEY` is set in the backend `.env`.
