
const { Novu } = require('@novu/node');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const novu = new Novu(API_KEY);

const FRESH_SUB_ID = 'test-user-fresh-' + Date.now();

async function testFreshSubscriber() {
    console.log(`--- Testing Fresh Subscriber: ${FRESH_SUB_ID} ---`);

    try {
        // 1. Trigger Notification
        console.log('🚀 Triggering "issue-created"...');
        await novu.trigger('issue-created', {
            to: {
                subscriberId: FRESH_SUB_ID,
                firstName: 'Test',
                lastName: 'Fresh'
            },
            payload: {
                title: 'Fresh Test Issue',
                issueId: 'fresh-123',
                url: 'https://example.com',
                description: 'Testing with fresh user'
            }
        });
        console.log('✅ Trigger sent.');

        // 2. Wait for processing
        console.log('⏳ Waiting 5s for processing...');
        await new Promise(r => setTimeout(r, 5000));

        // 3. Check Feed via fetch (to avoid SDK issues)
        console.log('🔍 Checking object feed...');

        const feedRes = await fetch(
            `https://api.novu.co/v1/subscribers/${FRESH_SUB_ID}/notifications/feed`,
            {
                headers: {
                    'Authorization': `ApiKey ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const feedData = await feedRes.json();
        const messages = feedData.data.data || [];

        console.log(`✅ Messages Found: ${messages.length}`);
        if (messages.length > 0) {
            console.log('   Content:', messages[0].content);
        } else {
            console.log('❌ Feed still empty. Workflow execution likely failed.');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

testFreshSubscriber();
