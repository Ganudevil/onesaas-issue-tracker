
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🌐 Raw Axios Probe...');

    try {
        const response = await axios.get('https://api.novu.co/v1/notification-templates', {
            headers: {
                'Authorization': `ApiKey ${API_KEY}`
            }
        });

        console.log('Status:', response.status);
        console.log('Count:', response.data.data.length);

        if (response.data.data.length > 0) {
            response.data.data.forEach(t => {
                console.log(`- ${t.name} (Trigger: ${t.triggers[0].identifier})`);
            });
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response) console.error('Data:', JSON.stringify(err.response.data));
    }
}
main();
