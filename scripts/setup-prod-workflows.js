
const axios = require('axios');
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';

const workflows = [
    {
        name: "Issue Created",
        identifier: "issue-created",
        subject: "🆕 New Issue: {{title}}",
        body: "A new issue has been created.<br>Priority: {{priority}}<br><a href=\"{{url}}/issues/{{issueId}}\">View Issue</a>"
    },
    {
        name: "Comment Added",
        identifier: "comment-added",
        subject: "💬 New Comment: {{issueTitle}}",
        body: "Comment: {{comment}}<br><a href=\"{{url}}/issues/{{issueId}}\">View Issue</a>"
    },
    {
        name: "Issue Status Changed",
        identifier: "issue-status-changed",
        subject: "🔄 Status Updated: {{title}}",
        body: "The status of issue #{{issueId}} has been changed to {{status}}.<br><a href=\"{{url}}/issues/{{issueId}}\">View Issue</a>"
    },
    {
        name: "Issue Assigned",
        identifier: "issue-assigned",
        subject: "👤 You were assigned: {{title}}",
        body: "You have been assigned to issue #{{issueId}}: {{title}}<br><a href=\"{{url}}/issues/{{issueId}}\">View Issue</a>"
    }
];

async function main() {
    console.log('🚀 Setting up Production Workflows...');

    // 1. Get Notification Group ID
    let groupId;
    try {
        const groupsRes = await axios.get('https://api.novu.co/v1/notification-groups', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });
        groupId = groupsRes.data.data[0]._id;
        console.log(`Using Notification Group: ${groupId}`);
    } catch (err) {
        console.error('❌ Failed to get group:', err.message);
        return;
    }

    for (const w of workflows) {
        console.log(`Creating "${w.name}"...`);
        try {
            await axios.post('https://api.novu.co/v1/notification-templates', {
                name: w.name,
                notificationGroupId: groupId,
                steps: [
                    {
                        template: {
                            type: 'in_app',
                            content: w.subject,
                            cta: {
                                action: {
                                    status: 'primary',
                                    buttons: [{ type: 'primary', content: 'View Issue' }]
                                }
                            }
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
                triggers: [{ identifier: w.identifier, type: 'event' }]
            }, {
                headers: { 'Authorization': `ApiKey ${API_KEY}` }
            });
            console.log(`   ✅ Success!`);
        } catch (err) {
            console.error(`   ❌ Failed: ${err.message}`);
            if (err.response) console.error('   Data:', JSON.stringify(err.response.data));
        }
    }
}
main();
