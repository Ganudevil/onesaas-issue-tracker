
const axios = require('axios');
const DEV_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('📝 Updating ALL Matching Development Workflows...');

    try {
        // 1. Get all templates in Dev
        const res = await axios.get('https://api.novu.co/v1/notification-templates', {
            headers: { 'Authorization': `ApiKey ${DEV_KEY}` }
        });

        const workflows = res.data.data;

        const contentMap = {
            'issue-created': {
                subject: '{{payload.title}}',
                body: '{{payload.title}} - {{payload.status}}'
            },
            'comment-added': {
                subject: 'Comment on {{payload.issueTitle}}',
                body: '{{payload.comment}}'
            },
            'issue-status-changed': {
                subject: '{{payload.title}}',
                body: 'Status updated to {{payload.status}}'
            },
            'issue-assigned': {
                subject: '{{payload.title}}',
                body: 'Assigned to you - {{payload.priority}}'
            }
        };

        for (const w of workflows) {
            // Check if name or trigger matches any of our known types
            // e.g. name "Issue Created" or trigger "issue-created-uv2w"
            let type = null;
            if (w.name.toLowerCase().includes('issue created') || w.triggers[0].identifier.includes('issue-created')) type = 'issue-created';
            else if (w.name.toLowerCase().includes('comment') || w.triggers[0].identifier.includes('comment')) type = 'comment-added';
            else if (w.name.toLowerCase().includes('status') || w.triggers[0].identifier.includes('status')) type = 'issue-status-changed';
            else if (w.name.toLowerCase().includes('assigned') || w.triggers[0].identifier.includes('assigned')) type = 'issue-assigned';

            if (type && contentMap[type]) {
                const target = contentMap[type];
                console.log(`Matching "${w.name}" (${w.triggers[0].identifier}) -> ${type}`);

                await axios.put(`https://api.novu.co/v1/notification-templates/${w._id}`, {
                    steps: [
                        {
                            template: {
                                type: 'in_app',
                                content: target.subject,
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
                                subject: target.subject,
                                content: [{ type: 'text', content: target.body }],
                                layoutId: null
                            },
                            active: true
                        }
                    ]
                }, {
                    headers: { 'Authorization': `ApiKey ${DEV_KEY}` }
                });
                console.log('   ✅ Updated content.');
            }
        }

        console.log('\n🚀 Promoting changes...');
        const changesRes = await axios.get('https://api.novu.co/v1/changes?promoted=false', {
            headers: { 'Authorization': `ApiKey ${DEV_KEY}` }
        });
        const changes = changesRes.data.data;
        console.log(`Found ${changes.length} pending changes.`);

        for (const change of changes) {
            console.log(`   Promoting ${change._id} (${change.templateName})...`);
            try {
                await axios.post(`https://api.novu.co/v1/changes/${change._id}/apply`, {}, {
                    headers: { 'Authorization': `ApiKey ${DEV_KEY}` }
                });
                console.log('      ✅ Success');
            } catch (err) {
                console.error('      ❌ Failed:', err.message);
            }
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
