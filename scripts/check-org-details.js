
const axios = require('axios');

async function main() {
    const key = '0e6ea8224d1faabe42f379cff81a2fc5';
    try {
        const resEnv = await axios.get('https://api.novu.co/v1/environments/me', {
            headers: { 'Authorization': `ApiKey ${key}` }
        });
        console.log('Environment Key 2:', JSON.stringify(resEnv.data.data, null, 2));
    } catch (err) {
        console.error(`❌ Failed: ${err.message}`);
    }
}
main();
