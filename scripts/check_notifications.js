
const { Novu } = require('@novu/node');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const SUBSCRIBER_ID = '1e694fab-a7e1-402b-bacb-16646592eb5b';

async function checkNotifications() {
    console.log('--- Checking Notifications (Direct API via fetch) ---');

    try {
        // 1. Get Unseen Count
        console.log(`\nFetching Unseen Count for: ${SUBSCRIBER_ID}...`);
        const countRes = await fetch(
            `https://api.novu.co/v1/subscribers/${SUBSCRIBER_ID}/notifications/unseen`,
            {
                headers: {
                    'Authorization': `ApiKey ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!countRes.ok) throw new Error(`Count failed: ${countRes.status} ${countRes.statusText}`);
        const countData = await countRes.json();
        console.log(`✅ Unseen Count: ${countData.data.count}`);


        // 2. Get Notification Feed (Actual Messages)
        console.log(`\nFetching Notification Feed...`);
        const feedRes = await fetch(
            `https://api.novu.co/v1/subscribers/${SUBSCRIBER_ID}/notifications/feed?page=0&limit=10`,
            {
                headers: {
                    'Authorization': `ApiKey ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!feedRes.ok) throw new Error(`Feed failed: ${feedRes.status} ${feedRes.statusText}`);
        const feedData = await feedRes.json();
        const messages = feedData.data.data || [];

        console.log(`✅ Found ${messages.length} messages in feed.`);

        messages.forEach(m => {
            console.log(`- ID: ${m._id}`);
            console.log(`  Content: ${m.content}`);
            console.log(`  Seen: ${m.seen}`);
            console.log(`  Read: ${m.read}`);
            console.log(`  Created: ${m.createdAt}`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

checkNotifications();
