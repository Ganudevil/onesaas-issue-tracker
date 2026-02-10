const { Novu } = require('@novu/node');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';

async function main() {
    console.log('🧪 Testing Production Integration...');
    const novu = new Novu(API_KEY);

    const subscriberId = 'test-subscriber-user';
    const email = 'test-user@example.com';

    // 1. Create/Update Subscriber
    try {
        console.log(`👤 Creating/Updating subscriber: ${subscriberId}...`);
        await novu.subscribers.identify(subscriberId, {
            email: email,
            firstName: 'Test',
            lastName: 'User'
        });
        console.log('   ✅ Subscriber ready.');
    } catch (e) {
        console.error('   ❌ Subscriber error:', e.message);
        return;
    }

    // 2. Trigger Event
    const triggerId = 'issue-created-blbs'; // One of our verified IDs
    console.log(`\n🔔 Triggering event: "${triggerId}"...`);

    try {
        const result = await novu.trigger(triggerId, {
            to: {
                subscriberId: subscriberId,
                email: email
            },
            payload: {
                title: 'Test Issue from Script',
                priority: 'High',
                description: 'This is a test notification to verify the workflow reset.',
                url: 'https://google.com',
                issueId: 'test-123'
            }
        });

        console.log(`   ✅ Trigger sent successfully!`);
        // Check if data structure is result.data.data (axios) or result.data (direct)
        const txnId = result.data?.data?.transactionId || result.data?.transactionId;
        console.log(`   Transaction ID: ${txnId}`);

        // 3. Check Notifications Feed (Optional verification)
        console.log(`\n📬 Checking subscriber feed...`);
        // Give it a moment to process
        await new Promise(r => setTimeout(r, 2000));

        const feed = await novu.subscribers.getNotificationsFeed(subscriberId, {
            limit: 5
        });

        const notification = feed.data.data.find(n => n.transactionId === result.data.transactionId);

        if (notification) {
            console.log(`   ✅ Notification found in feed!`);
            console.log(`      Content: ${notification.content}`);
        } else {
            console.log(`   ⚠️  Notification not found in feed yet (might be processing or email-only).`);
        }

    } catch (e) {
        console.error('   ❌ Trigger Failed:', e.message);
        if (e.response?.data) {
            console.error('   Details:', JSON.stringify(e.response.data));
        }
    }
}

main();
