
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

const MAPPING = {
    'Issue Created': 'issue-created',
    'Comment Added': 'comment-added',
    'Issue Status Changed': 'issue-status-changed',
    'Issue Assigned': 'issue-assigned'
};

async function main() {
    console.log('🔄 Normalizing Workflow IDs...');
    const novu = new Novu(API_KEY);

    // Get all templates
    const result = await novu.notificationTemplates.getAll();
    const templates = result.data.data;

    for (const t of templates) {
        const cleanId = MAPPING[t.name];
        if (!cleanId) continue;

        const currentId = t.triggers[0]?.identifier;

        // If current ID is different from clean ID (e.g. "issue-created-123" !== "issue-created")
        if (currentId !== cleanId) {
            console.log(`Fixing "${t.name}": ${currentId} -> ${cleanId}`);
            try {
                // Determine step content if needed (sometimes required for update)
                // But try minimal update first
                await novu.notificationTemplates.update(t._id, {
                    triggers: [{ identifier: cleanId, type: 'event' }]
                });
                console.log('   ✅ Renamed.');
            } catch (err) {
                console.error('   ❌ Failed to rename:', err.message);
            }
        } else {
            console.log(`✅ "${t.name}" already has correct ID.`);
        }
    }
}
main();
