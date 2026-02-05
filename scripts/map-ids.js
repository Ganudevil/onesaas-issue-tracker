
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🔄 Mapping Workflow IDs from Changes...');

    try {
        const response = await axios.get('https://api.novu.co/v1/changes?promoted=false', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });

        const changes = response.data.data;
        const mapping = {};

        changes.forEach(c => {
            if (c.type === 'NotificationTemplate') {
                mapping[c.templateName] = c._entityId;
            }
        });

        console.log('Detected Mappings (Template Name -> entityId):');
        console.log(JSON.stringify(mapping, null, 2));

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
