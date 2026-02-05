
const axios = require('axios');
const DEV_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🚀 Promoting Pending Changes...');

    try {
        const changesRes = await axios.get('https://api.novu.co/v1/changes?promoted=false', {
            headers: { 'Authorization': `ApiKey ${DEV_KEY}` }
        });
        const changes = changesRes.data.data;
        console.log(`Found ${changes.length} pending changes.`);

        for (const change of changes) {
            console.log(`   Promoting ${change._id} (${change.templateName || change.type})...`);
            try {
                await axios.post(`https://api.novu.co/v1/changes/${change._id}/apply`, {}, {
                    headers: { 'Authorization': `ApiKey ${DEV_KEY}` }
                });
                console.log('      ✅ Success');
            } catch (err) {
                console.error('      ❌ Failed:', err.message);
                if (err.response) console.log(JSON.stringify(err.response.data));
            }
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
