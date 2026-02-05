
const axios = require('axios');

async function checkEnv(key, label) {
    console.log(`\n--- Checking ${label} ---`);
    try {
        const res = await axios.get('https://api.novu.co/v1/environments/me', {
            headers: { 'Authorization': `ApiKey ${key}` }
        });
        console.log(`   Name: ${res.data.data.name}`);
        console.log(`   Identifier: ${res.data.data._id}`);
        console.log(`   Organization ID: ${res.data.data._organizationId}`);
    } catch (err) {
        console.error(`   ❌ Failed: ${err.message}`);
    }
}

async function main() {
    await checkEnv('84ec40b73ccba3e7205185bff4e00ffe', 'Key 1 (Development?)');
    await checkEnv('0e6ea8224d1faabe42f379cff81a2fc5', 'Key 2 (Production?)');
}
main();
