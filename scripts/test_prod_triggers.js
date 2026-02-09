
const { Novu } = require('@novu/node');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const novu = new Novu(API_KEY);

const WORKFLOWS = [
    { identifier: 'comment-added', payload: { issueTitle: 'Prod Test', comment: 'Checking Fix', issueId: '123' } },
    { identifier: 'issue-assigned', payload: { title: 'Prod Assignment', issueId: '123' } },
    { identifier: 'issue-status-changed', payload: { title: 'Prod Status', status: 'Done', issueId: '123' } },
    { identifier: 'issue-created', payload: { title: 'Prod Creation', issueId: '123' } }
];

// Admin Subscriber ID
const SUBSCRIBER_ID = '1e694fab-a7e1-402b-bacb-16646592eb5b';

async function testProd() {
    console.log('--- Testing Production Triggers ---');

    for (const w of WORKFLOWS) {
        console.log(`🚀 Triggering "${w.identifier}"...`);
        try {
            const res = await novu.trigger(w.identifier, {
                to: { subscriberId: SUBSCRIBER_ID },
                payload: { ...w.payload, url: 'https://example.com' }
            });
            console.log(`   ✅ Transaction: ${res.data.data.transactionId}`);
        } catch (err) {
            console.error(`   ❌ Failed: ${err.message}`);
            if (err.response?.data) console.error(JSON.stringify(err.response.data));
        }
    }

    console.log('\n--- Waiting for Delivery (5s) ---');
    await new Promise(r => setTimeout(r, 5000));

    console.log('--- Checking Feed ---');
    try {
        const feedRes = await fetch(
            `https://api.novu.co/v1/subscribers/${SUBSCRIBER_ID}/notifications/feed`,
            {
                headers: {
                    'Authorization': `ApiKey ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        const feedData = await feedRes.json();
        const messages = feedData.data.data || [];

        console.log(`✅ Messages in Feed: ${messages.length}`);
        if (messages.length > 0) {
            console.log('Most recent message:', messages[0].content);
        } else {
            console.log('❌ Feed is empty. Check Activity Feed in Dashboard for errors.');
        }

    } catch (e) {
        console.error(e);
    }
}

testProd();
