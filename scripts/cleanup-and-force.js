
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🧹 Cleaning up Duplicate Workflows...');
    const novu = new Novu(API_KEY);

    // Get all workflows (page 0, limit 100)
    const result = await novu.notificationTemplates.getAll(0, 100);
    const all = result.data.data;

    // Define the Clean IDs we WANT to keep
    const keep = ['issue-created', 'issue-assigned', 'comment-added', 'issue-status-changed'];

    for (const t of all) {
        const id = t.triggers[0].identifier;

        // If it's NOT in the keep list, delete it.
        // (This targets issue-created-xwfb, etc.)
        if (!keep.includes(id)) {
            console.log(`Deleting Duplicate: "${t.name}" (ID: ${id})...`);
            try {
                await novu.notificationTemplates.delete(t._id);
                console.log('   ✅ Deleted');
            } catch (e) {
                console.error('   ❌ Failed to delete:', e.message);
            }
        } else {
            console.log(`Keeping Clean: "${t.name}" (ID: ${id})`);
            // Force Update to trigger sync
            console.log('   Updating description to force sync...');
            await novu.notificationTemplates.update(t._id, { description: 'Ready for Prod ' + Date.now() });
        }
    }
}
main();
