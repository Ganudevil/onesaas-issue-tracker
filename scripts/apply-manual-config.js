
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('📝 Configuring Manual Workflows Content...');

    const mapping = {
        "69831c4f93bdb65fcbf334ec": {
            name: "Issue Created",
            subject: "New Issue: {{title}}",
            body: "A new issue has been created.<br>Priority: {{priority}}<br><a href=\"{{url}}\">View Issue</a>"
        },
        "69831c5042aa4e6cd1ca3958": {
            name: "Comment Added",
            subject: "New Comment on {{issueTitle}}",
            body: "Comment: {{comment}}<br><a href=\"{{url}}\">View Issue</a>"
        },
        "69831c50e2861b689db690ed": {
            name: "Issue Status Changed",
            subject: "Status Updated: {{title}}",
            body: "The status of issue #{{issueId}} has been changed to {{status}}."
        },
        "69831c50e2861b689db6913c": {
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
