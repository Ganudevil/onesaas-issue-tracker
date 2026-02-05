
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🧪 Normalizing Workflow Identifiers...');

    try {
        const response = await axios.get('https://api.novu.co/v1/notification-templates', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` },
            params: { page: 0, limit: 100 }
        });

        const workflows = response.data.data;
        console.log(`Found ${workflows.length} workflows to check.`);

        for (const t of workflows) {
            const currentId = t.triggers[0].identifier;

            // Map suffixed IDs back to clean ones
            const cleanMapping = {
                'issue-assigned-': 'issue-assigned',
                'issue-status-changed-': 'issue-status-changed',
                'comment-added-': 'comment-added',
                'issue-created-': 'issue-created'
            };

            let targetId = null;
            for (const [prefix, clean] of Object.entries(cleanMapping)) {
                if (currentId.startsWith(prefix)) {
                    targetId = clean;
                    break;
                }
            }

            if (targetId) {
                console.log(`Renaming "${t.name}": ${currentId} -> ${targetId}...`);
                try {
                    await axios.put(`https://api.novu.co/v1/notification-templates/${t._id}`, {
                        triggers: [{ identifier: targetId, type: 'event' }]
                    }, {
                        headers: { 'Authorization': `ApiKey ${API_KEY}` }
                    });
                    console.log(`   ✅ Successful!`);
                } catch (err) {
                    console.error(`   ❌ Failed to rename: ${err.message}`);
                    if (err.response) console.error('Data:', JSON.stringify(err.response.data));
                }
            }
        }
    } catch (err) {
        console.error('❌ Error Listing:', err.message);
    }
}
main();
