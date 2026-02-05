
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';
const WORKFLOW_ID = '698304f47cb278f3d2848532'; // Issue Created

async function main() {
    console.log(`🌐 /v1/workflows/${WORKFLOW_ID} Raw Probe...`);

    try {
        const response = await axios.get(`https://api.novu.co/v1/workflows/${WORKFLOW_ID}`, {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });

        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(res.data.data, null, 2));

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response) {
            console.log('Status:', err.response.status);
            console.log('Data:', JSON.stringify(err.response.data));
        }
    }
}
main();
