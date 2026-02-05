
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🌍 Checking Environment...');
    const novu = new Novu(API_KEY);

    try {
        const res = await novu.environments.getCurrent();
        console.log('Current Environment:', res.data.data.name);
        console.log('Environment ID:', res.data.data._id);
        console.log('Identifier:', res.data.data.identifier);

        const all = await novu.environments.getAll();
        console.log('\nAll Environments for this organization:');
        all.data.data.forEach(e => {
            console.log(`- ${e.name} (${e._id}) - Identifier: ${e.identifier}`);
        });

    } catch (err) {
        console.error('❌ Failed:', err.message);
        if (err.response) console.error('Data:', JSON.stringify(err.response.data));
    }
}
main();
