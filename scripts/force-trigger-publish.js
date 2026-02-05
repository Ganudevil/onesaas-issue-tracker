
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🔄 Forcing Workflow Updates to Trigger Publish...');
    const novu = new Novu(API_KEY);

    const result = await novu.notificationTemplates.getAll();
    const headers = result.data.data;

    for (const t of headers) {
        if (!t.triggers[0]?.identifier.includes('issue')) continue; // Should catch issue-created etc

        console.log(`Touching "${t.name}"...`);
        try {
            await novu.notificationTemplates.update(t._id, {
                description: t.description + ' ' // Add a space to force change
            });
            console.log('   ✅ Updated.');
        } catch (err) {
            console.error('   ❌ Failed:', err.message);
        }
    }
}
main();
