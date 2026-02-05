
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🏢 Checking Organization...');

    try {
        const response = await axios.get('https://api.novu.co/v1/organizations/me', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });

        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data.data, null, 2));

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
