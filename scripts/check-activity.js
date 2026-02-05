
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';
const TRANSACTION_ID = 'txn_69831a48m7rcu12rc0i2';

async function main() {
    console.log('📜 Checking Activity Feed...');

    try {
        const response = await axios.get(`https://api.novu.co/v1/activity?transactionId=${TRANSACTION_ID}`, {
            headers: {
                'Authorization': `ApiKey ${API_KEY}`
            }
        });

        console.log('Status:', response.status);
        if (response.data.data && response.data.data.length > 0) {
            const activity = response.data.data[0];
            console.log('Template Name:', activity.templateName);
            console.log('Template ID:', activity._templateId);
            console.log('Full Activity Data:', JSON.stringify(activity, null, 2));
        } else {
            console.log('No activity found for this transaction ID.');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
