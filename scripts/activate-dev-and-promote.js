
const axios = require('axios');
const DEV_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🚀 Activating Development Workflows & Promoting...');

    try {
        const res = await axios.get('https://api.novu.co/v1/notification-templates', {
            headers: { 'Authorization': `ApiKey ${DEV_KEY}` }
        });

        const workflows = res.data.data;
        const targets = ['issue-created-5q2w', 'comment-added-44gh', 'issue-status-changed-i6e1', 'issue-assigned-rqdp'];

        for (const w of workflows) {
            const trigger = w.triggers[0].identifier;

            // Only care about our targets, OR try all if we want to be safe.
            // Let's try all triggers that match our patterns
            console.log(`Checking "${w.name}" (${trigger})...`);

            try {
                await axios.put(`https://api.novu.co/v1/notification-templates/${w._id}/status`, {
                    active: true
                }, {
                    headers: { 'Authorization': `ApiKey ${DEV_KEY}` }
                });
                console.log(`   ✅ Activated.`);
            } catch (e) {
                console.error(`   ❌ Failed to activate: ${e.message}`);
                if (e.response) {
                    console.error(`      Detail: ${JSON.stringify(e.response.data)}`);
                }
            }
        }

        console.log('\n🚀 Promoting Status Changes...');
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
            }
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
