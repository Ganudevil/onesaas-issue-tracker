const { Novu } = require('@novu/node');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';

const KEEP_IDENTIFIERS = [
    'issue-created-blbs',
    'issue-assigned-d7el',
    'issue-status-changed-al62',
    'comment-added-ez1b'
];

async function main() {
    console.log('🧹 Starting Cleanup of Duplicates...');
    const novu = new Novu(API_KEY);

    try {
        const { data } = await novu.notificationTemplates.getAll(0, 100);
        const workflows = data.data;
        console.log(`Found ${workflows.length} total workflows.`);

        // Sort by creation date (ID timestamp) descending so we keep the newest issue-updated
        workflows.sort((a, b) => b._id.localeCompare(a._id));

        let issueUpdatedKept = false;

        for (const w of workflows) {
            const identifier = w.triggers[0]?.identifier;

            let shouldKeep = false;

            if (KEEP_IDENTIFIERS.includes(identifier)) {
                shouldKeep = true;
            } else if (identifier === 'issue-updated') {
                if (!issueUpdatedKept) {
                    shouldKeep = true;
                    issueUpdatedKept = true; // Only keep the first (newest) one
                }
            }

            if (shouldKeep) {
                console.log(`✅ Keeping: ${w.name} (${identifier}) - ${w._id}`);
            } else {
                console.log(`🗑️  Deleting: ${w.name} (${identifier}) - ${w._id}...`);
                try {
                    await novu.notificationTemplates.delete(w._id);
                    console.log('   Done');
                } catch (e) {
                    console.error('   ❌ Failed:', e.message);
                }
            }
        }

    } catch (e) {
        console.error('❌ Error:', e.message);
    }

    console.log('\n✨ Cleanup Complete.');
}

main();
