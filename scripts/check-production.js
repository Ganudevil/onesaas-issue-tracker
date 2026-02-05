
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));

// This is the Production Key (read-only for changes, but can list)
// Obtained from previous context (backend env default)
const PROD_API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';

async function main() {
    console.log('🔍 Checking PRODUCTION Workflows...');
    const novu = new Novu(PROD_API_KEY);

    try {
        const result = await novu.notificationTemplates.getAll();
        const workflows = result.data.data;

        console.log(`\nFound ${workflows.length} workflows in Production.`);

        workflows.forEach(t => {
            console.log(`- "${t.name}" (ID: ${t.triggers[0]?.identifier})`);
        });

    } catch (err) {
        console.error('❌ Failed to check Production:', err.message);
    }
}
main();
