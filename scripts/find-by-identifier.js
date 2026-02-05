
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🔍 Finding Manual Workflows by Identifier...');
    const novu = new Novu(API_KEY);

    const identifiers = ['issue-created', 'issue-assigned', 'comment-added', 'issue-status-changed'];

    for (const id of identifiers) {
        console.log(`Searching for identifier: "${id}"...`);
        try {
            // Some versions of the SDK might have this, some might not.
            // Let's try to find it by filtering getAll if possible, 
            // but I'll also try a direct GET to /v1/workflows/identifier/{id} if I have to.

            const result = await novu.notificationTemplates.getAll(0, 100);
            const found = result.data.data.find(t => t.triggers[0].identifier === id);

            if (found) {
                console.log(`   ✅ FOUND: "${found.name}" | ID: ${found._id}`);
            } else {
                console.log(`   ❌ NOT FOUND in listing.`);
            }
        } catch (e) {
            console.error(`   ❌ Error:`, e.message);
        }
    }
}
main();
