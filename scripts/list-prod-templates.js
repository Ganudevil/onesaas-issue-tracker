
const axios = require('axios');
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';

async function main() {
    console.log('🔍 Listing all templates in Production...');
    try {
        const res = await axios.get('https://api.novu.co/v1/notification-templates', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });
        const templates = res.data.data;
        console.log(`Found ${templates.length} templates:`);
        templates.forEach(t => {
            console.log(`- Name: "${t.name}" | ID: ${t._id} | Trigger: ${t.triggers[0].identifier}`);
        });
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
