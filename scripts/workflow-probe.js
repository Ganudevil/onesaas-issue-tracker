
const axios = require('axios');
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';

async function main() {
    console.log('🌐 /v1/workflows Raw Probe...');

    try {
        const response = await axios.get('https://api.novu.co/v1/workflows', {
            headers: {
                'Authorization': `ApiKey ${API_KEY}`
            }
        });

        console.log('Status:', response.status);
        if (response.data.data) {
            console.log('Count:', response.data.data.length);
            response.data.data.forEach(w => {
                console.log(`- ${w.name} (ID: ${w._id}, Trigger: ${w.triggers[0].identifier})`);
            });
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response) {
            console.log('Status:', err.response.status);
            // console.log('Data:', JSON.stringify(err.response.data));
        }
    }
}
main();
