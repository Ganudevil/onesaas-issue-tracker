
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('📋 Listing ALL Manual Workflows...');
    const novu = new Novu(API_KEY);

    try {
        const result = await novu.notificationTemplates.getAll(0, 50);
        const workflows = result.data.data;

        console.log(`\nFound ${workflows.length} workflows:`);

        workflows.forEach(t => {
            console.log(`- Name: "${t.name}" | Trigger ID: "${t.triggers[0].identifier}"`);
        });
    } catch (err) {
        console.error('❌ Failed:', err.message);
    }
}
main();
