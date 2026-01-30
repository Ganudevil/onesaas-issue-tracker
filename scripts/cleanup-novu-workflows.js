const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));

async function cleanupWorkflows() {
    const apiKey = process.argv[2];
    if (!apiKey) {
        console.error('Please provide API key');
        process.exit(1);
    }

    const novu = new Novu(apiKey);

    try {
        console.log('🧹 Cleanup started...');

        let hasMore = true;
        let page = 0;
        let deletedCount = 0;

        while (hasMore) {
            const { data } = await novu.notificationTemplates.getAll(page, 20);
            const workflows = data.data;

            if (workflows.length === 0) {
                console.log('No more workflows found.');
                hasMore = false;
                break;
            }

            console.log(`Found ${workflows.length} workflows to delete...`);

            for (const wf of workflows) {
                try {
                    console.log(`Processing: ${wf.name}...`);

                    // Deactivate first if active
                    if (wf.active) {
                        try {
                            console.log('   Deactivating...');
                            await novu.notificationTemplates.updateStatus(wf._id, false);
                        } catch (deactivateErr) {
                            console.warn(`   Failed to deactivate: ${deactivateErr.message}`);
                        }
                    }

                    console.log(`   Deleting...`);
                    await novu.notificationTemplates.delete(wf._id);
                    deletedCount++;
                    // Small delay
                    await new Promise(r => setTimeout(r, 200));
                } catch (err) {
                    console.error(`Failed to delete ${wf._id}:`, err.message);
                    if (err.response?.data) {
                        console.error('   Details:', JSON.stringify(err.response.data));
                    }
                }
            }
        }

        console.log(`\n✨ Cleanup complete! Deleted ${deletedCount} workflows.`);

    } catch (error) {
        console.error('Error during cleanup:', error.message);
        process.exit(1);
    }
}

cleanupWorkflows();
