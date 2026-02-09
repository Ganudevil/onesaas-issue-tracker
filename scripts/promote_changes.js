
const { Novu } = require('@novu/node');
const axios = require('axios');

// Development API Key (Where the changes are)
const DEV_API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function promoteChanges() {
    console.log('--- Promoting Changes from Dev to Prod ---');

    try {
        // 1. Fetch Pending Changes
        console.log('Fetching pending changes...');
        const changesRes = await axios.get('https://api.novu.co/v1/changes?promoted=false', {
            headers: { 'Authorization': `ApiKey ${DEV_API_KEY}` }
        });

        const changes = changesRes.data.data;
        console.log(`FOUND: ${changes.length} pending changes.`);

        if (changes.length === 0) {
            console.log('✅ No changes to promote.');
            return;
        }

        // 2. Apply Changes
        const changeIds = changes.map(c => c._id);
        console.log(`Promoting ${changeIds.length} changes...`);

        const applyRes = await axios.post(
            'https://api.novu.co/v1/changes/bulk/apply',
            { changeIds: changeIds },
            { headers: { 'Authorization': `ApiKey ${DEV_API_KEY}` } }
        );

        console.log('✅ Promotion Successful!');
        console.log(JSON.stringify(applyRes.data, null, 2));

    } catch (err) {
        console.error('❌ Error promoting changes:', err.message);
        if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
    }
}

promoteChanges();
