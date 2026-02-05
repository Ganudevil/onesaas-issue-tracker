
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🔍 Probing for ALIVE templates in changes...');

    try {
        const response = await axios.get('https://api.novu.co/v1/changes?promoted=false', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });

        const changes = response.data.data;
        console.log(`Checking ${changes.length} pending changes...`);

        const aliveTemplates = [];

        for (const c of changes) {
            if (c.type === 'NotificationTemplate') {
                const eid = c._entityId;
                try {
                    const res = await axios.get(`https://api.novu.co/v1/notification-templates/${eid}`, {
                        headers: { 'Authorization': `ApiKey ${API_KEY}` }
                    });
                    if (res.status === 200) {
                        console.log(`   ✅ ALIVE: "${c.templateName}" (Entity ID: ${eid})`);
                        aliveTemplates.push({ name: c.templateName, id: eid });
                    }
                } catch (err) {
                    // console.log(`   ❌ DEAD: "${c.templateName}" (${eid}) - ${err.message}`);
                }
            }
        }

        console.log('\n--- SUMMARY OF ALIVE TEMPLATES ---');
        console.log(JSON.stringify(aliveTemplates, null, 2));

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
