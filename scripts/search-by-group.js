
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🔍 Searching by Group...');

    try {
        const response = await axios.get('https://api.novu.co/v1/notification-templates', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` },
            params: { page: 0, limit: 100 }
        });

        console.log('Total templates found:', response.data.data.length);

        // Let's also try to fetch the group specifically if there's an endpoint for that
        // But usually it's just filtering.

        // If it's still 0, I'll try to list "Workfows" (v2) again but check if I can filter by "origin"

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
