
const axios = require('axios');
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';

async function main() {
    console.log('🔄 Full Extraction from Changes...');

    try {
        const response = await axios.get('https://api.novu.co/v1/changes?promoted=false', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });

        const changes = response.data.data;
        const targetNames = ['Issue Created', 'Comment Added', 'Issue Status Changed', 'Issue Assigned'];

        changes.forEach(c => {
            if (targetNames.includes(c.templateName) || targetNames.includes(c.name)) {
                console.log(`- Name: "${c.templateName || c.name}" | EntityID: ${c._entityId} | Type: ${c.type}`);
                if (c.change) {
                    const identifierDiff = c.change.find(d => d.path.includes('identifier'));
                    if (identifierDiff) console.log(`   Trigger: ${identifierDiff.val}`);
                }
            }
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
