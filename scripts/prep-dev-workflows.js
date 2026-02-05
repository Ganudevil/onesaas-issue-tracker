
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe'; // Development Key

const configurations = [
    {
        name: "Issue Created",
        entityId: "698323d24d5ed375b9cc58b9",
        subject: "🆕 New Issue: {{title}}",
        body: "A new issue has been created.<br>Priority: {{priority}}<br><a href=\"{{url}}/issues/{{issueId}}\">View Issue</a>"
    },
    {
        name: "Comment Added",
        entityId: "698323d342aa4e6cd1cc0e14",
        subject: "💬 New Comment: {{issueTitle}}",
        body: "Comment: {{comment}}<br><a href=\"{{url}}/issues/{{issueId}}\">View Issue</a>"
    },
    {
        name: "Issue Status Changed",
        entityId: "698323d37a338293c6145cd0",
        subject: "🔄 Status Updated: {{title}}",
        body: "The status of issue #{{issueId}} has been changed to {{status}}.<br><a href=\"{{url}}/issues/{{issueId}}\">View Issue</a>"
    },
    {
        name: "Issue Assigned",
        entityId: "698323d3e5648168f4ad9e17",
        subject: "👤 You were assigned: {{title}}",
        body: "You have been assigned to issue #{{issueId}}: {{title}}<br><a href=\"{{url}}/issues/{{issueId}}\">View Issue</a>"
    }
];

async function main() {
    console.log('📝 Updating Development Workflows Content...');

    for (const conf of configurations) {
        console.log(`Updating "${conf.name}" (${conf.entityId})...`);
        try {
            await axios.put(`https://api.novu.co/v1/notification-templates/${conf.entityId}`, {
                steps: [
                    {
                        template: {
                            type: 'in_app',
                            content: conf.subject,
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
                            subject: conf.subject,
                            content: [{ type: 'text', content: conf.body }]
                        },
                        active: true
                    }
                ]
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
