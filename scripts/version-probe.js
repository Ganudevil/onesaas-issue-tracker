
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('📡 Versioned API Probe...');

    const versions = ['2024-02-01', '2022-11-15'];
    const endpoints = ['/v1/workflows', '/v1/notification-templates'];

    for (const v of versions) {
        for (const ep of endpoints) {
            console.log(`\n--- ${ep} | Version: ${v} ---`);
            try {
                const res = await axios.get(`https://api.novu.co${ep}`, {
                    headers: {
                        'Authorization': `ApiKey ${API_KEY}`,
                        'Novu-API-Version': v
                    }
                });
                console.log(`   Count: ${res.data.data?.length ?? 0}`);
                if (res.data.data?.length > 0) {
                    res.data.data.forEach(t => {
                        console.log(`   - ${t.name} (${t._id})`);
                    });
                }
            } catch (err) {
                console.error(`   ❌ Failed: ${err.message}`);
            }
        }
    }
}
main();
