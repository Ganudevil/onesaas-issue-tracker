
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🔄 Deep Inspecting Manual Workflows via Changes...');

    try {
        const response = await axios.get('https://api.novu.co/v1/changes?promoted=false', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });

        const changes = response.data.data;
        const manualTemplates = changes.filter(c => c.type === 'NotificationTemplate');

        console.log(`Found ${manualTemplates.length} template changes.`);

        for (const c of manualTemplates) {
            const eid = c._entityId;
            console.log(`\n--- Template: "${c.templateName}" (ID: ${eid}) ---`);
            try {
                const res = await axios.get(`https://api.novu.co/v1/notification-templates/${eid}`, {
                    headers: { 'Authorization': `ApiKey ${API_KEY}` }
                });
                console.log(JSON.stringify(res.data.data, null, 2));
            } catch (err) {
                console.log(`   ❌ Failed to fetch ${eid}: ${err.message}`);
            }
        }

    } catch (err) {
        console.error('❌ Error fetching changes:', err.message);
    }
}
main();
