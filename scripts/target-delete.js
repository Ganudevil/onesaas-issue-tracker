
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🧹 Targeted Deletion of Invisible Manual Workflows...');

    const ids = [
        '69831c50e2861b689db6913c',
        '69831c50e2861b689db690ed',
        '69831c5042aa4e6cd1ca3958',
        '69831c4f93bdb65fcbf334ec'
    ];

    for (const id of ids) {
        console.log(`Deleting ID: ${id}...`);
        try {
            await axios.delete(`https://api.novu.co/v1/notification-templates/${id}`, {
                headers: { 'Authorization': `ApiKey ${API_KEY}` }
            });
            console.log(`   ✅ SUCCESS!`);
        } catch (err) {
            console.error(`   ❌ FAILED: ${err.message}`);
        }
    }
}
main();
