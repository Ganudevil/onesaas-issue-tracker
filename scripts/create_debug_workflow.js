
const { Novu } = require('@novu/node');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const novu = new Novu(API_KEY);

async function createAndTestWorkflow() {
    console.log('--- Creating Debug Workflow ---');
    const ID = 'debug-workflow-' + Date.now();

    try {
        // 1. Create Workflow
        console.log(`Creating workflow: ${ID}...`);
        const flow = await novu.notificationTemplates.create({
            name: 'Debug Workflow ' + ID,
            notificationGroupId: '67a32ab895e69123b7640428', // General Group ID? Need to find one.
            steps: [
                {
                    template: {
                        type: 'in_app',
                        content: 'This is a debug message. Vars: {{testVar}}',
                        variables: [{ name: 'testVar', type: 'String', required: true }]
                    },
                    active: true
                }
            ],
            triggers: [
                {
                    identifier: ID,
                    type: 'event',
                    variables: [{ name: 'testVar', type: 'String' }]
                }
            ],
            active: true
        });

        console.log(`✅ Created! ID: ${flow.data._id}`);

        // 2. Trigger
        console.log(`🚀 Triggering ${ID}...`);
        await novu.trigger(ID, {
            to: {
                subscriberId: 'debug-sub-1',
                firstName: 'Debug',
                lastName: 'User'
            },
            payload: {
                testVar: 'Hello World'
            }
        });
        console.log('✅ Trigger sent.');

        // 3. Wait & Check
        console.log('⏳ Waiting 5s...');
        await new Promise(r => setTimeout(r, 5000));

        const feedRes = await fetch(
            `https://api.novu.co/v1/subscribers/debug-sub-1/notifications/feed`,
            {
                headers: {
                    'Authorization': `ApiKey ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        const feedData = await feedRes.json();
        const messages = feedData.data.data || [];

        console.log(`✅ Messages: ${messages.length}`);
        if (messages.length > 0) console.log('   Content:', messages[0].content);

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
    }
}

// Helper to find a group ID first
async function run() {
    try {
        const groups = await novu.notificationGroups.get();
        if (groups.data.data.length === 0) throw new Error('No notification groups found');
        const groupId = groups.data.data[0]._id;

        // Monkey-patch the create call logic or just pass it
        // Actually I'll just rewrite the main function to use this Group ID
        console.log(`Using Group ID: ${groupId}`);

        // Re-implement create logic here to use valid groupId
        const ID = 'debug-workflow-' + Date.now();
        const flow = await novu.notificationTemplates.create({
            name: 'Debug Workflow ' + ID,
            notificationGroupId: groupId,
            steps: [{
                template: {
                    type: 'in_app',
                    content: 'Debug: {{testVar}}',
                    variables: [{ name: 'testVar', type: 'String', required: true }]
                },
                active: true
            }],
            triggers: [{ identifier: ID, type: 'event', variables: [{ name: 'testVar', type: 'String' }] }],
            active: true
        });
        console.log(`✅ Created! ID: ${flow.data._id}`);

        const subId = 'debug-sub-' + Date.now();
        await novu.trigger(ID, {
            to: { subscriberId: subId, firstName: 'Debug' },
            payload: { testVar: 'Success!' }
        });
        console.log('✅ Trigger sent.');

        await new Promise(r => setTimeout(r, 5000));

        const feedRes = await fetch(`https://api.novu.co/v1/subscribers/${subId}/notifications/feed`, {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });
        const data = await feedRes.json();
        const msgs = data.data.data || [];
        console.log(`✅ Messages: ${msgs.length}`);
        if (msgs.length > 0) console.log('   Content:', msgs[0].content);

    } catch (e) {
        console.error(e);
    }
}

run();
