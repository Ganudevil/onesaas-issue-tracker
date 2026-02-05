
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🏗️  Ensuring Workflows Content...');

    const workflows = [
        {
            name: "Issue Created",
            id: "issue-created",
            subject: "New Issue: {{title}}",
            body: "A new issue has been created.<br>Priority: {{priority}}<br><a href=\"{{url}}\">View Issue</a>"
        },
        {
            name: "Comment Added",
            id: "comment-added",
            subject: "New Comment on {{issueTitle}}",
            body: "Comment: {{comment}}<br><a href=\"{{url}}\">View Issue</a>"
        },
        {
            name: "Issue Status Changed",
            id: "issue-status-changed",
            subject: "Status Updated: {{title}}",
            body: "The status of issue #{{issueId}} has been changed to {{status}}."
        },
        {
            name: "Issue Assigned",
            id: "issue-assigned",
            subject: "You have been assigned: {{title}}",
            body: "You have been assigned to issue #{{issueId}}: {{title}}"
        }
    ];

    for (const w of workflows) {
        console.log(`Processing "${w.name}"...`);

        try {
            // 1. Try to create it fresh.
            // If it already exists, this will likely fail with a conflict.
            const createRes = await axios.post('https://api.novu.co/v1/notification-templates', {
                name: w.name,
                notificationGroupId: "69577e420528c5e13861fd60", // General Group
                steps: [
                    {
                        template: {
                            type: 'in_app',
                            content: w.subject
                        },
                        active: true
                    },
                    {
                        template: {
                            type: 'email',
                            subject: w.subject,
                            content: [{ type: 'text', content: w.body }]
                        },
                        active: true
                    }
                ],
                active: true,
                triggers: [{ identifier: w.id, type: 'event' }]
            }, {
                headers: { 'Authorization': `ApiKey ${API_KEY}` }
            });
            console.log(`   ✅ Created Successfully!`);

        } catch (err) {
            if (err.response && (err.response.status === 409 || err.response.data.message?.includes('exists'))) {
                console.log(`   ⚠️ Already exists. Attempting to update existing ones found in changes...`);
                // We'll use the entity IDs we found earlier as a backup if we find them again
            } else {
                console.error(`   ❌ Failed: ${err.message}`);
                if (err.response) console.error('Data:', JSON.stringify(err.response.data));
            }
        }
    }
}
main();
