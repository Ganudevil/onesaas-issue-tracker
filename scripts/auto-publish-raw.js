
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe'; // Development Key (where changes originate)

async function main() {
    console.log('🚀 Attempting Auto-Publish via Raw API...');

    try {
        // 1. Get Changes
        console.log('📥 Fetching pending changes...');
        const result = await axios.get('https://api.novu.co/v1/changes?promoted=false', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });
        const changes = result.data.data;

        console.log(`Found ${changes.length} pending changes.`);

        if (changes.length === 0) {
            console.log('✅ No changes pending!');
            return;
        }

        // 2. Apply Changes
        let applied = 0;
        for (const change of changes) {
            console.log(`   Promoting change: ${change._id} (${change.type} - ${change.templateName || change.name})...`);
            try {
                // Direct POST to /v1/changes/{changeId}/apply
                await axios.post(`https://api.novu.co/v1/changes/${change._id}/apply`, {}, {
                    headers: { 'Authorization': `ApiKey ${API_KEY}` }
                });
                console.log('      ✅ Success');
                applied++;
            } catch (err) {
                console.error('      ❌ Failed:', err.message);
                if (err.response) console.error('      Data:', JSON.stringify(err.response.data));
            }
        }

        console.log(`\n🎉 Processed ${applied}/${changes.length} changes.`);

    } catch (err) {
        console.error('❌ API Error:', err.message);
    }
}
main();
