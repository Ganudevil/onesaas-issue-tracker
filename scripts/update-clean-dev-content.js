
const axios = require('axios');
const DEV_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('📝 Updating Clean Development Workflows...');

    try {
        // 1. Get all templates in Dev
        const res = await axios.get('https://api.novu.co/v1/notification-templates', {
            headers: { 'Authorization': `ApiKey ${DEV_KEY}` }
        });

        const workflows = res.data.data;

        // Find the clean ones
        const targets = [
            {
                id: 'issue-created', name: 'Issue Created',
                subject: '🆕 New Issue: {{payload.title}}',
                body: 'A new issue has been created.<br>Priority: {{payload.priority}}<br><a href="{{payload.url}}/issues/{{payload.issueId}}">View Issue</a>'
            },
            {
                id: 'comment-added', name: 'Comment Added',
                subject: '💬 New Comment: {{payload.issueTitle}}',
                body: 'Comment: {{payload.comment}}<br><a href="{{payload.url}}/issues/{{payload.issueId}}">View Issue</a>'
            },
            {
                id: 'issue-status-changed', name: 'Issue Status Changed',
                subject: '🔄 Status Updated: {{payload.title}}',
                body: 'The status of issue #{{payload.issueId}} has been changed to {{payload.status}}.<br><a href="{{payload.url}}/issues/{{payload.issueId}}">View Issue</a>'
            },
            {
                id: 'issue-assigned', name: 'Issue Assigned',
                subject: '👤 You were assigned: {{payload.title}}',
                body: 'You have been assigned to issue #{{payload.issueId}}: {{payload.title}}<br><a href="{{payload.url}}/issues/{{payload.issueId}}">View Issue</a>'
            }
        ];

        for (const target of targets) {
            const wf = workflows.find(w => w.triggers[0].identifier === target.id);
            if (wf) {
                console.log(`Found "${target.name}" (ID: ${wf._id}). Updating...`);
                await axios.put(`https://api.novu.co/v1/notification-templates/${wf._id}`, {
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
                console.log('   ✅ Updated.');
            } else {
                console.log(`   ⚠️ Could not find clean workflow for "${target.id}"`);
            }
        }

        console.log('\n🚀 Promoting changes...');
        const changesRes = await axios.get('https://api.novu.co/v1/changes?promoted=false', {
            headers: { 'Authorization': `ApiKey ${DEV_KEY}` }
        });
        const changes = changesRes.data.data;
        console.log(`Found ${changes.length} pending changes.`);

        for (const change of changes) {
            console.log(`   Promoting ${change._id} (${change.templateName || change.type})...`);
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
        if (err.response) console.log(JSON.stringify(err.response.data));
    }
}
main();
