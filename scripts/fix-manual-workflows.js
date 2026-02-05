
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🔄 Finding and Updating Manual Workflows via Changes...');

    try {
        const response = await axios.get('https://api.novu.co/v1/changes?promoted=false', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });

        const changes = response.data.data;
        console.log(`Found ${changes.length} pending changes.`);

        const configs = {
            'Issue Created': {
                subject: 'New Issue: {{title}}',
                body: 'A new issue has been created.<br>Priority: {{priority}}<br><a href="{{url}}">View Issue</a>'
            },
            'Issue Assigned': {
                subject: 'You have been assigned: {{title}}',
                body: 'You have been assigned to issue #{{issueId}}: {{title}}'
            },
            'Comment Added': {
                subject: 'New Comment on {{issueTitle}}',
                body: 'Comment: {{comment}}<br><a href="{{url}}">View Issue</a>'
            },
            'Issue Status Changed': {
                subject: 'Status Updated: {{title}}',
                body: 'The status of issue #{{issueId}} has been changed to {{status}}.'
            }
        };

        // Deduplicate: Pick the LATEST entityId for each name
        const latestChanges = {};
        changes.forEach(c => {
            if (c.type === 'NotificationTemplate' && configs[c.templateName]) {
                // We keep overwriting so the last one found (usually most recent in the list) is taken
                latestChanges[c.templateName] = c._entityId;
            }
        });

        for (const [name, entityId] of Object.entries(latestChanges)) {
            const conf = configs[name];
            console.log(`\nProcessing: "${name}" (Entity ID: ${entityId})`);

            try {
                await axios.put(`https://api.novu.co/v1/notification-templates/${entityId}`, {
                    steps: [
                        {
                            template: {
                                type: 'in_app',
                                content: conf.subject
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
                console.log(`   ✅ SUCCESS: Updated "${name}"`);
            } catch (err) {
                console.error(`   ❌ FAILED to update: ${err.message}`);
                if (err.response) {
                    console.error('   Status:', err.response.status);
                    // console.error('   Data:', JSON.stringify(err.response.data));
                }
            }
        }

    } catch (err) {
        console.error('❌ Error fetching changes:', err.message);
    }
}
main();
