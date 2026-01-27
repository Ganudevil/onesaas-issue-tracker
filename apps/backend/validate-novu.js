require('dotenv').config();
const { Novu } = require('@novu/node');

async function validate() {
    const apiKey = process.env.NOVU_API_KEY;
    if (!apiKey) {
        console.error('❌ NOVU_API_KEY is missing in .env');
        process.exit(1);
    }

    console.log('✅ Found NOVU_API_KEY');
    const novu = new Novu(apiKey);

    const testSubscriberId = 'test-user-' + Date.now();
    const testEmail = 'test-' + Date.now() + '@example.com';

    console.log(`\n--- Test 1: Trigger with Subscriber ID ONLY (No Email) ---`);
    console.log(`Subscriber ID: ${testSubscriberId}`);

    // This replicates the scenario where getUser returns a string fallback
    // and the user DOES NOT exist in Novu yet.
    try {
        const response = await novu.trigger('issue-created', {
            to: {
                subscriberId: testSubscriberId
                // No email provided
            },
            payload: {
                title: 'Test Issue (No Email)',
                issueId: '123',
                url: 'http://localhost:3000'
            }
        });
        console.log('⚠️ Trigger call succeeded (API accepted it). Response:', response.data);
        console.log('👉 Check Novu dashboard. This notification likely failed to deliver or was skipped if channel is Email.');
    } catch (error) {
        console.error('❌ Trigger failed:', error.message);
        if (error.response) console.error('Response:', error.response.data);
    }

    console.log(`\n--- Test 2: Trigger with Full Subscriber Details (With Email) ---`);
    try {
        const response = await novu.trigger('issue-created', {
            to: {
                subscriberId: testSubscriberId,
                email: testEmail,
                firstName: 'Test User'
            },
            payload: {
                title: 'Test Issue (With Email)',
                issueId: '123',
                url: 'http://localhost:3000'
            }
        });
        console.log('✅ Trigger call succeeded. Response:', response.data);
        console.log(`👉 This should be delivered to ${testEmail} (if configured in sandbox).`);
    } catch (error) {
        console.error('❌ Trigger failed:', error.message);
    }
}

validate();
