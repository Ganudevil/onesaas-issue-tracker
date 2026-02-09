
const { Novu } = require('@novu/node');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const novu = new Novu(API_KEY);

const WORKFLOWS = [
    {
        identifier: 'comment-added',
        name: 'Comment Added',
        content: 'New comment on **{{issueTitle}}**: {{comment}}',
        variables: [
            { name: 'issueTitle', type: 'String', required: true },
            { name: 'comment', type: 'String', required: true },
            { name: 'url', type: 'String', required: false },
            { name: 'issueId', type: 'String', required: true }
        ]
    },
    {
        identifier: 'issue-assigned',
        name: 'Issue Assigned',
        content: 'You have been assigned to issue: **{{title}}**',
        variables: [
            { name: 'title', type: 'String', required: true },
            { name: 'issueId', type: 'String', required: true },
            { name: 'url', type: 'String', required: false },
            { name: 'description', type: 'String', required: false }
        ]
    },
    {
        identifier: 'issue-status-changed',
        name: 'Issue Status Changed',
        content: 'Issue **{{title}}** status changed to: {{status}}',
        variables: [
            { name: 'title', type: 'String', required: true },
            { name: 'status', type: 'String', required: true },
            { name: 'issueId', type: 'String', required: true },
            { name: 'url', type: 'String', required: false }
        ]
    },
    {
        identifier: 'issue-created', // Ensuring this one is fixed too
        name: 'Issue Created',
        content: 'New issue created: **{{title}}**',
        variables: [
            { name: 'title', type: 'String', required: true },
            { name: 'issueId', type: 'String', required: true },
            { name: 'url', type: 'String', required: false },
            { name: 'description', type: 'String', required: false }
        ]
    }
];

// Admin Subscriber ID for testing
const SUBSCRIBER_ID = '1e694fab-a7e1-402b-bacb-16646592eb5b';

async function forceFixAndTest() {
    console.log('--- Force Fixing & Testing All Workflows ---');

    try {
        const workflows = await novu.notificationTemplates.getAll();

        for (const config of WORKFLOWS) {
            const flow = workflows.data.data.find(w => w.triggers[0].identifier === config.identifier);

            if (!flow) {
                console.log(`❌ Workflow "${config.identifier}" NOT found. Skipping.`);
                continue;
            }

            console.log(`\n🔧 Updating "${config.identifier}" (${flow._id})...`);

            // Overwrite with a SINGLE In-App step to remove any broken/digest steps
            await novu.notificationTemplates.update(flow._id, {
                name: config.name,
                description: config.name,
                active: true,
                steps: [
                    {
                        template: {
                            type: 'in_app',
                            content: config.content,
                            cta: {
                                data: {
                                    url: '{{url}}'
                                }
                            },
                            variables: config.variables
                        },
                        active: true
                    }
                ],
                triggers: [
                    {
                        identifier: config.identifier,
                        type: 'event',
                        variables: config.variables
                    }
                ]
            });
            console.log(`✅ Updated successfully!`);

            // Immediate Test
            console.log(`🚀 Testing trigger for "${config.identifier}"...`);
            const payload = {};
            // Populate dummy data for all variables
            config.variables.forEach(v => {
                payload[v.name] = `Test ${v.name}`;
            });
            // Fix specific URL/ID for realism
            payload.url = 'https://frontend-three-brown-95.vercel.app/issues/test-id';
            payload.issueId = 'test-id';

            const triggerRes = await novu.trigger(config.identifier, {
                to: { subscriberId: SUBSCRIBER_ID },
                payload: payload
            });
            console.log(`   Transaction ID: ${triggerRes.data.data.transactionId}`);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
    }
}

forceFixAndTest();
