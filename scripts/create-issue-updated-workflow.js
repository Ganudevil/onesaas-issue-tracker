
const axios = require('axios');
const DEV_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🆕 Creating "Issue Updated" Workflow in DEV...');

    try {
        const payload = {
            name: 'Issue Updated',
            notificationGroupId: '69577e420528c5e13861fd60',
            steps: [
                {
                    template: {
                        type: 'in_app',
                        content: '{{payload.changeType}} in issue: {{payload.title}}',
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
                        subject: 'Issue Updated: {{payload.title}}',
                        content: [{ type: 'text', content: 'The issue details have been updated.<br><a href="{{payload.url}}/issues/{{payload.issueId}}">View Issue</a>' }]
                    },
                    active: false // Disabled to prevent failures without email provider
                }
            ],
            triggers: [
                {
                    identifier: 'issue-updated',
                    type: 'event',
                    variables: [
                        { name: 'title' },
                        { name: 'issueId' },
                        { name: 'changeType' },
                        { name: 'url' }
                    ]
                }
            ],
            active: true
        };

        const res = await axios.post('https://api.novu.co/v1/notification-templates', payload, {
            headers: { 'Authorization': `ApiKey ${DEV_KEY}` }
        });

        console.log(`✅ Created Workflow. ID: ${res.data.data._id}`);
        console.log(`   Identifier: ${res.data.data.triggers[0].identifier}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response) console.log(JSON.stringify(err.response.data));
    }
}
main();
