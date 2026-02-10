const { Novu } = require('@novu/node');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';

async function main() {
    console.log('🔧 Resolving "issue-updated" Collision...');
    const novu = new Novu(API_KEY);

    try {
        const { data } = await novu.notificationTemplates.getAll(0, 100);
        const workflows = data.data;

        // Find all with identifier 'issue-updated'
        const duplicates = workflows.filter(w => w.triggers[0]?.identifier === 'issue-updated');

        console.log(`Found ${duplicates.length} workflows with identifier "issue-updated".`);

        if (duplicates.length > 1) {
            // Sort by ID descending (assuming lexical ID sort ~ roughly timestamp for Mongo/Novu IDs, or just pick one)
            // Ideally we want to keep the one we just "verified" or touched.
            // Let's keep the one with the most recent _id.
            duplicates.sort((a, b) => b._id.localeCompare(a._id));

            const toKeep = duplicates[0];
            const toRename = duplicates.slice(1);

            console.log(`✅ Keeping: ${toKeep.name} (${toKeep._id})`);

            for (const w of toRename) {
                const newId = `issue-updated-archived-${Date.now()}`;
                console.log(`✏️  Renaming ${w.name} (${w._id}) -> ${newId}...`);
                try {
                    await novu.notificationTemplates.update(w._id, {
                        identifier: newId,
                        active: false // Also try to deactivate
                    });
                    console.log('   ✅ Renamed and Deactivated');
                } catch (e) {
                    console.error('   ❌ Failed to rename:', e.message);
                }
            }
        } else {
            console.log('✅ No collision found.');
        }

    } catch (e) {
        console.error('❌ Error:', e.message);
    }

    console.log('\n✨ Collision Check Complete.');
}

main();
