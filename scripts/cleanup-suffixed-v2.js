
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🧹 Final Cleanup of Suffixed Workflows...');

    try {
        const response = await axios.get('https://api.novu.co/v1/notification-templates', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` },
            params: { page: 0, limit: 100 }
        });

        const workflows = response.data.data;
        const suffixes = ['-ltjd', '-0bev', '-1lmk', '-ibtu'];

        for (const t of workflows) {
            const currentId = t.triggers[0].identifier;
            if (suffixes.some(s => currentId.endsWith(s))) {
                console.log(`Deleting temporary workflow: "${t.name}" (ID: ${currentId})...`);
                try {
                    await axios.delete(`https://api.novu.co/v1/notification-templates/${t._id}`, {
                        headers: { 'Authorization': `ApiKey ${API_KEY}` }
                    });
                    console.log(`   ✅ Deleted!`);
                } catch (err) {
                    console.error(`   ❌ Failed to delete: ${err.message}`);
                }
            }
        }
    } catch (err) {
        console.error('❌ Error Listing:', err.message);
    }
}
main();
