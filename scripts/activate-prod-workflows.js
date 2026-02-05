const axios = require('axios');
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5'; // Production Key

async function main() {
    console.log('🚀 Activating Production Workflows...');
    try {
        const res = await axios.get('https://api.novu.co/v1/notification-templates', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });

        const workflows = res.data.data;
        const targets = ['issue-created-5q2w', 'comment-added-44gh', 'issue-status-changed-i6e1', 'issue-assigned-rqdp'];

        for (const w of workflows) {
            const trigger = w.triggers[0].identifier;
            if (targets.includes(trigger)) {
                console.log(`Checking status for "${w.name}" (${trigger})...`);

                // Activate
                try {
                    await axios.put(`https://api.novu.co/v1/notification-templates/${w._id}/status`, {
                        active: true
                    }, {
                        headers: { 'Authorization': `ApiKey ${API_KEY}` }
                    });
                    console.log(`   ✅ Activated.`);
                } catch (e) {
                    console.error(`   ❌ Failed to activate: ${e.message}`);
                }
            }
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
