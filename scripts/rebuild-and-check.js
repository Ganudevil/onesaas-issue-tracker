
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

const config = [
    { name: 'Issue Created', id: 'issue-created' },
    { name: 'Comment Added', id: 'comment-added' },
    { name: 'Issue Status Changed', id: 'issue-status-changed' },
    { name: 'Issue Assigned', id: 'issue-assigned' }
];

async function main() {
    console.log('🚧 RECREATING WORKFLOWS...');
    const novu = new Novu(API_KEY);

    // Get Notification Group ID
    const groupsResponse = await novu.notificationGroups.get();
    const groupId = groupsResponse.data.data[0]._id;

    for (const c of config) {
        try {
            console.log(`Creating "${c.name}"...`);
            const res = await novu.notificationTemplates.create({
                name: c.name,
                notificationGroupId: groupId,
                steps: [{
                    template: { type: 'in_app', content: 'Test Content' },
                    active: true
                }],
                active: true,
                triggers: [{ identifier: c.id, type: 'event' }]
            });

            // Immediately fetch the created one to see its REAL ID
            // The create response often contains the ID, but let's be safe.
            const createdId = res.data.data.triggers[0].identifier;
            console.log(`   ✅ Successful. ID: "${createdId}"`);

            // Force touch for publish
            await novu.notificationTemplates.update(res.data.data._id, { description: 'Updated for Sync' });

        } catch (e) {
            console.error(`   ❌ Failed to create ${c.name}:`, e.message);
        }
    }

    console.log('\n--- ID CHECK ---');
    const result = await novu.notificationTemplates.getAll();
    result.data.data.forEach(t => {
        console.log(`"${t.name}" -> ID: ${t.triggers[0].identifier}`);
    });
}
main();
