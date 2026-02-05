
const axios = require('axios');
const DEV_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🔍 Listing DEV Workflows...');
    try {
        const res = await axios.get('https://api.novu.co/v1/notification-templates', {
            headers: { 'Authorization': `ApiKey ${DEV_KEY}` }
        });
        const workflows = res.data.data;
        console.log(`Found ${workflows.length} workflows:`);
        workflows.forEach(w => {
            console.log(`- Name: "${w.name}" | ID: ${w._id} | Trigger: ${w.triggers[0].identifier}`);
        });
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
