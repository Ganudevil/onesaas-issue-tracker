
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🎯 Attempting Direct Update Check...');
    const novu = new Novu(API_KEY);

    // We can't update by trigger ID directly in one call if we don't have the _id.
    // But we can try to GET by identifier.

    const ids = ['issue-created', 'comment-added', 'issue-status-changed', 'issue-assigned'];

    for (const id of ids) {
        console.log(`Checking trigger: "${id}"...`);
        try {
            // NOTE: There is no direct "getTemplateByTriggerId" in the SDK docs usually, 
            // but trigger identifiers must be unique.
            // If they don't show up in getAll(), they probably aren't in this environment.

            // Let's try to fetch all blueprints or something? 
            // No, the user created them manually.

            // Final check: Maybe they are NOT in the first 10 results?
            const res = await novu.notificationTemplates.getAll(0, 100);
            const found = res.data.data.find(t => t.triggers[0].identifier === id);

            if (found) {
                console.log(`   ✅ FOUND! Internal _id: ${found._id}`);
            } else {
                console.log(`   ❌ NOT FOUND in the first 100 workflows.`);
            }
        } catch (err) {
            console.error(`   ❌ API Error:`, err.message);
        }
    }
}
main();
