
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('💥 DELETING ALL WORKFLOWS IN DEV...');
    const novu = new Novu(API_KEY);

    // Fetch all
    const result = await novu.notificationTemplates.getAll({ limit: 100 });
    const templates = result.data.data;

    console.log(`Found ${templates.length} workflows.`);

    for (const t of templates) {
        console.log(`Deleting "${t.name}" (${t._id})...`);
        try {
            await novu.notificationTemplates.delete(t._id);
            console.log('   ✅ Deleted');
        } catch (e) {
            console.error('   ❌ Failed:', e.message);
        }
    }
    console.log('✨ Development Environment is CLEAN.');
}
main();
