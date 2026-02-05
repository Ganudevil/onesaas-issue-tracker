
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('📡 Deep API Probe starting...');

    const endpoints = [
        '/v1/notification-templates',
        '/v1/workflows',
        '/v1/changes?promoted=false',
        '/v1/notification-groups',
        '/v1/environments/me'
    ];

    for (const ep of endpoints) {
        console.log(`\n--- Probing: ${ep} ---`);
        try {
            const res = await axios.get(`https://api.novu.co${ep}`, {
                headers: { 'Authorization': `ApiKey ${API_KEY}` }
            });
            const data = res.data.data || res.data;
            if (Array.isArray(data)) {
                console.log(`   Count: ${data.length}`);
                if (data.length > 0) {
                    data.forEach(item => {
                        const id = item._id || item.id || 'no-id';
                        const name = item.name || item.templateName || 'no-name';
                        const trigger = (item.triggers && item.triggers[0]?.identifier) || 'no-trigger';
                        console.log(`   - [${name}] ID: ${id} | Trigger: ${trigger}`);
                    });
                }
            } else {
                console.log('   Data (Object):', JSON.stringify(data).substring(0, 200) + '...');
            }
        } catch (err) {
            console.error(`   ❌ Failed: ${err.message}`);
        }
    }
}
main();
