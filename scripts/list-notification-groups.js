
const axios = require('axios');
const DEV_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🔍 Listing Notification Groups...');
    try {
        const res = await axios.get('https://api.novu.co/v1/notification-groups', {
            headers: { 'Authorization': `ApiKey ${DEV_KEY}` }
        });

        const groups = res.data.data;
        groups.forEach(g => {
            console.log(`- Name: "${g.name}" | ID: ${g._id}`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
