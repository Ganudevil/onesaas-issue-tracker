
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('📝 Configuring Workflow Content...');

    const mapping = {
        "698304f47cb278f3d2848532": {
            name: "Issue Created",
            subject: "New Issue: {{title}}",
            body: "A new issue has been created.<br>Priority: {{priority}}<br><a href=\"{{url}}\">View Issue</a>"
        },
        "698304f4807f8ec09550f91d": {
            name: "Comment Added",
            subject: "New Comment on {{issueTitle}}",
            body: "Comment: {{comment}}<br><a href=\"{{url}}\">View Issue</a>"
        },
        "698303863283e1d48a449fb3": {
            name: "Issue Status Changed",
            subject: "Status Updated: {{title}}",
            body: "The status of issue #{{issueId}} has been changed to {{status}}."
        },
        "6983038793bdb65fcbe9e494": {
            name: "Issue Assigned",
            subject: "You have been assigned: {{title}}",
            body: "You have been assigned to issue #{{issueId}}: {{title}}"
        }
    };

    for (const [id, config] of Object.entries(mapping)) {
        console.log(`Updating "${config.name}" (ID: ${id})...`);
        try {
            const res = await axios.put(`https://api.novu.co/v1/notification-templates/${id}`, {
                steps: [
                    {
                        template: {
                            type: 'in_app',
                            content: config.subject
                        },
                        active: true
                    },
                    {
                        template: {
                            type: 'email',
                            subject: config.subject,
                            content: [{ type: 'text', content: config.body }]
                        },
                        active: true
                    }
                ]
            }, {
                headers: { 'Authorization': `ApiKey ${API_KEY}` }
            });
            console.log(`   ✅ Successful!`);
        } catch (err) {
            console.error(`   ❌ Failed: ${err.message}`);
            if (err.response) console.error('Data:', JSON.stringify(err.response.data));
        }
    }
}
main();
