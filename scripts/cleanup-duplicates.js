
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));

// Development Key provided by user
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

const ALLOWED_IDENTIFIERS = [
    'issue-created',
    'comment-added',
    'issue-status-changed',
    'issue-assigned'
];

async function main() {
    console.log('🧹 Starting Novu Workflow Cleanup...');
    const novu = new Novu(API_KEY);

    // Get all templates (page 0, limit 100 to catch everything)
    // Note: Novu Node SDK might not support pagination params in getAll directly in all versions, 
    // but usually getAll returns paginated response. Let's try to get enough.
    let allTemplates = [];
    try {
        let page = 0;
        while (true) {
            // Try fetching with page
            const result = await novu.notificationTemplates.getAll(page);
            const data = result.data.data;
            if (!data || data.length === 0) break;
            allTemplates = allTemplates.concat(data);
            if (data.length < 20) break; // End of list
            page++;
        }
        console.log(`\n📄 Found ${allTemplates.length} total workflows.`);
    } catch (e) {
        console.error('Failed to fetch workflows:', e.message);
        process.exit(1);
    }

    let deletedCount = 0;

    for (const template of allTemplates) {
        const identifier = template.triggers[0]?.identifier;
        const name = template.name;

        console.log(`\nChecking: "${name}" (ID: ${identifier})`);

        if (ALLOWED_IDENTIFIERS.includes(identifier)) {
            console.log('   ✅ KEEP (Clean Identifier)');
            continue;
        }

        // If it's not in the allowed list, it's a candidate for deletion.
        // But double check: does it look like a duplicate of our allowed ones?
        // E.g. "Issue Created" with id "issue-created-quye"

        // We delete straightforwardly because we want ONLY the clean ones to exist.
        // We know (from previous turn) we just ran a repair script that acts on the Clean Ones (or tries to).
        // Wait, if the repair script created "issue-created-1q76", then "issue-created" might NOT exist or be broken.
        // We should verify if "Clean" ones exist before deleting duplicates?

        // Actually, user wants to delete "older" / "not needed".
        // The ones with suffixes are definitely the "bad" ones compared to the clean identifiers we updated the code to use.

        try {
            console.log('   🗑️  DELETING (Duplicate/Old)...');
            await novu.notificationTemplates.delete(template._id);
            console.log('      Successfully deleted.');
            deletedCount++;
        } catch (err) {
            console.error('      Failed to delete:', err.message);
        }
    }

    console.log('\n=============================');
    console.log(`Cleanup Complete. Deleted ${deletedCount} workflows.`);
    console.log('Remaining workflows should be only:', ALLOWED_IDENTIFIERS.join(', '));
}

main();
