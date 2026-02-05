
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('👻 Ghost Buster... Deleting conflicting manual workflows...');

    const idsToDelete = [
        "6983038793bdb65fcbe9e494", // Issue Assigned
        "698303863283e1d48a449fb3", // Issue Status Changed
        "698304f4807f8ec09550f91d", // Comment Added
        "698304f47cb278f3d2848532"  // Issue Created
    ];

    for (const id of idsToDelete) {
        console.log(`Deleting Ghost ID: ${id}...`);
        try {
            const res = await axios.delete(`https://api.novu.co/v1/notification-templates/${id}`, {
                headers: { 'Authorization': `ApiKey ${API_KEY}` }
            });
            console.log(`   ✅ Deleted!`);
        } catch (err) {
            console.error(`   ❌ Failed: ${err.message}`);
            // If it fails with 404, maybe it's already gone or it's a "Workflow" not a "Template"
            if (err.response && err.response.status === 404) {
                console.log(`   Trying /v1/workflows/${id}...`);
                try {
                    await axios.delete(`https://api.novu.co/v1/workflows/${id}`, {
                        headers: { 'Authorization': `ApiKey ${API_KEY}` }
                    });
                    console.log(`   ✅ Deleted from Workflows!`);
                } catch (err2) {
                    console.error(`   ❌ Still Failed on /v1/workflows: ${err2.message}`);
                }
            }
        }
    }
}
main();
