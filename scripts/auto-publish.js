
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🚀 Attempting Auto-Publish via API...');
    const novu = new Novu(API_KEY);

    try {
        // Check if changes resource exists on the client
        if (!novu.changes) {
            console.error('❌ This version of Novu SDK does not support "changes" API.');
            return;
        }

        // 1. Get Changes
        console.log('📥 Fetching pending changes...');
        const result = await novu.changes.get({ promoted: false });
        const changes = result.data.data;

        console.log(`Found ${changes.length} pending changes.`);

        if (changes.length === 0) {
            console.log('✅ No changes pending!');
            return;
        }

        // 2. Apply Changes
        // Note: Changes need to be applied ONE BY ONE or in bulk? 
        // SDK usually has .apply(changeId) or .applyMany(ids)

        // Let's try applying one by one
        let applied = 0;
        for (const change of changes) {
            console.log(`   Promoting change: ${change._id} (${change.type})...`);
            try {
                await novu.changes.apply(change._id);
                console.log('      ✅ Success');
                applied++;
            } catch (err) {
                console.error('      ❌ Failed:', err.message);
            }
        }

        console.log(`\n🎉 Processed ${applied}/${changes.length} changes.`);

    } catch (err) {
        console.error('❌ API Error:', err.message);
        if (err.response?.data) console.error(JSON.stringify(err.response.data));
    }
}
main();
