
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🔍 Searching for "Issue" related templates...');

    try {
        const res = await axios.get('https://api.novu.co/v1/notification-templates', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` },
            params: { page: 0, limit: 100 }
        });

        const all = res.data.data;
        const filtered = all.filter(t => t.name.startsWith('Issue') || t.name.startsWith('Comment'));

        console.log(`Matched ${filtered.length} items out of ${all.length}.`);
        filtered.forEach(t => {
            console.log(`- [${t.name}] ID: ${t._id} | Trigger: ${t.triggers[0].identifier}`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
