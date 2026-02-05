
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe'; // Development Key

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
    }
];

async function main() {
    console.log('🚀 Creating Clean Triggers in Development for Promotion...');

    let groupId;
    try {
        const groupsRes = await axios.get('https://api.novu.co/v1/notification-groups', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });
        groupId = groupsRes.data.data[0]._id;
    } catch (err) {
        console.error('❌ Failed to get group:', err.message);
        return;
    }

    for (const w of workflows) {
        console.log(`Creating "${w.name}" with identifier "${w.identifier}"...`);
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
