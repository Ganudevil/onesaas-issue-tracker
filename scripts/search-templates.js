
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🔍 Searching Templates...');

    try {
        // Try searching by name
        const response = await axios.get('https://api.novu.co/v1/notification-templates?name=Issue Created', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });

        console.log('Status:', response.status);
        console.log('Count:', response.data.data.length);

        if (response.data.data.length > 0) {
            console.log('Found:', response.data.data[0].name, 'ID:', response.data.data[0]._id);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
