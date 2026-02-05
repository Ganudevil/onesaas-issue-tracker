
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🔄 Dumping Changes...');

    try {
        const response = await axios.get('https://api.novu.co/v1/changes?promoted=false', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });

        if (response.data.data.length > 0) {
            console.log(JSON.stringify(response.data.data[0], null, 2));
        } else {
            console.log('No changes found.');
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
