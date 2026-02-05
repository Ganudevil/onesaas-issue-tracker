
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🔄 Extracting Entity Details from Changes...');

    try {
        const response = await axios.get('https://api.novu.co/v1/changes?promoted=false', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });

        const changes = response.data.data;
        const targetNames = ['Issue Created', 'Comment Added', 'Issue Status Changed', 'Issue Assigned'];
        const templates = changes.filter(c => targetNames.includes(c.templateName) || targetNames.includes(c.name));

        console.log(`Found ${templates.length} manual workflow/template changes.`);

        for (const c of templates) {
            console.log(`\n--- Change for "${c.templateName || c.name}" (Entity ID: ${c._entityId}) ---`);
            // The change object itself often contains the "change" array which is the diff/snapshot
            if (c.change) {
                console.log('Change Snapshot found.');
                // console.log(JSON.stringify(c.change, null, 2));

                // Let's see if we can reconstruct the object
                const obj = {};
                c.change.forEach(diff => {
                    if (diff.op === 'add' || diff.op === 'replace') {
                        let current = obj;
                        for (let i = 0; i < diff.path.length - 1; i++) {
                            const p = diff.path[i];
                            if (!current[p]) current[p] = (typeof diff.path[i + 1] === 'number' ? [] : {});
                            current = current[p];
                        }
                        current[diff.path[diff.path.length - 1]] = diff.val;
                    }
                });
                console.log('Reconstructed Object:');
                console.log(JSON.stringify(obj, null, 2));
            }
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
