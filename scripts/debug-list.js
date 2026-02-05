
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🐞 Debugging List...');
    const novu = new Novu(API_KEY);

    try {
        // Try page 0
        console.log('Requesting page 0...');
        const res = await novu.notificationTemplates.getAll(0);
        console.log('Response Count:', res.data.data.length);
        console.log('Sample ID:', res.data.data[0]?._id);
        console.log('Sample Trigger:', res.data.data[0]?.triggers[0]?.identifier);

        if (res.data.data.length > 0) {
            console.log('--- FOUND WORKFLOWS ---');
            res.data.data.forEach(w => {
                console.log(`[${w.name}] ID: ${w.triggers[0].identifier}`);
            });
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err);
    }
}
main();
