
const axios = require('axios');
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';

const suffixedIds = [
    '69832c6e3283e1d48a53f9d2', // issue-created-uv2w
    '69832c6d22938a512af73e73', // issue-assigned-rqdp
    '69832c6db4e9eec31e1f2b29', // comment-added-pbfq
    '69832c6c22938a512af73e27'  // issue-status-changed-i6e1
];

async function main() {
    console.log('🧹 Cleaning up suffixed workflows in Production...');
    for (const id of suffixedIds) {
        console.log(`Deleting ${id}...`);
        try {
            await axios.delete(`https://api.novu.co/v1/notification-templates/${id}`, {
                headers: { 'Authorization': `ApiKey ${API_KEY}` }
            });
            console.log('   ✅ Deleted');
        } catch (err) {
            console.error(`   ❌ Failed: ${err.message}`);
        }
    }
}
main();
