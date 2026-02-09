const { Novu } = require('@novu/node');

const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const novu = new Novu(API_KEY);
const SUBSCRIBER_ID = '1e694fab-a7e1-402b-bacb-16646592eb5b';

async function checkMessages() {
    console.log('--- Checking Novu Messages API ---\n');

    try {
        // Try to get messages for the subscriber using the messages API
        const messagesRes = await novu.subscribers.getNotificationsFeed(SUBSCRIBER_ID);
        console.log('Messages Response:', JSON.stringify(messagesRes.data, null, 2));

        if (messagesRes.data.data && messagesRes.data.data.length > 0) {
            console.log(`\n✅ FOUND ${messagesRes.data.data.length} messages!`);
            console.log('\nMost recent message:');
            console.log(messagesRes.data.data[0]);
            console.log('\n🎯 SOLUTION: Messages exist in Novu! Frontend just needs updated fetch logic.');
        } else {
            console.log('\n❌ No messages found. Notifications are not being stored.');
        }
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
    }
}

checkMessages();
