
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';
const ID = '69831c4f93bdb65fcbf334ec'; // Issue Created

async function main() {
    console.log(`🔍 Verifying Content for ID: ${ID}...`);

    try {
        const response = await axios.get(`https://api.novu.co/v1/notification-templates/${ID}`, {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });

        const t = response.data.data;
        console.log(`Name: ${t.name}`);
        console.log(`Trigger: ${t.triggers[0].identifier}`);
        console.log(`Steps: ${t.steps.length}`);
        t.steps.forEach((s, i) => {
            console.log(`Step ${i + 1} (${s.template.type}):`);
            console.log(`   Subject: ${s.template.subject || 'N/A'}`);
            console.log(`   Content: ${JSON.stringify(s.template.content)}`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
