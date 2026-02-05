
const axios = require('axios');
const PROD_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';

async function main() {
    console.log('🌐 Production Raw Axios Probe...');

    try {
        const response = await axios.get('https://api.novu.co/v1/notification-templates', {
            headers: { 'Authorization': `ApiKey ${PROD_KEY}` }
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
    }
}
main();
