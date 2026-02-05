
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🎣 Fishing for IDs via Conflict...');

    const identifiers = ['issue-created', 'issue-assigned', 'comment-added', 'issue-status-changed'];

    for (const id of identifiers) {
        console.log(`Trying to create "${id}"...`);
        try {
            await axios.post('https://api.novu.co/v1/notification-templates', {
                name: id, // just for the attempt
                notificationGroupId: "69577e420528c5e13861fd60",
                steps: [],
                triggers: [{ identifier: id, type: 'event' }]
            }, {
                headers: { 'Authorization': `ApiKey ${API_KEY}` }
            });
            console.log(`   ✅ Created fresh (this shouldn't happen if it exists!)`);
        } catch (err) {
            console.log(`   ❌ Failed: ${err.message}`);
            if (err.response) {
                console.log('   Data:', JSON.stringify(err.response.data));
            }
        }
    }
}
main();
