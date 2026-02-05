
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('📋 Fetching ALL templates (active and inactive)...');

    try {
        const res = await axios.get('https://api.novu.co/v1/notification-templates', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` },
            params: { page: 0, limit: 100 } // Novu usually returns everything if no filter, but let's be sure
        });

        const all = res.data.data;
        console.log(`Found ${all.length} total items.`);

        all.forEach(t => {
            console.log(`- [${t.name}] ID: ${t._id} | Trigger: ${t.triggers[0].identifier} | Active: ${t.active}`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
