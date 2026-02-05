
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🔄 Checking Pending Changes...');

    try {
        const response = await axios.get('https://api.novu.co/v1/changes?promoted=false', {
            headers: {
                'Authorization': `ApiKey ${API_KEY}`
            }
        });

        console.log('Status:', response.status);
        if (response.data.data && response.data.data.length > 0) {
            console.log(`Found ${response.data.data.length} pending changes.`);
            response.data.data.forEach(c => {
                console.log(`- Type: ${c.type}, ID: ${c._id}, EntityID: ${c._entityId}`);
            });
        } else {
            console.log('No pending changes found.');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
