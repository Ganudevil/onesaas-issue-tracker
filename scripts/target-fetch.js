
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🎯 Targeted ID Fetch...');

    const idsToTry = [
        '69831c50e2861b689db6913c', // Issue Assigned from changes
        '69831c50e2861b689db690ed', // Issue Status Changed from changes
        '69831c5042aa4e6cd1ca3958', // Comment Added from changes
        '69831c4f93bdb65fcbf334ec', // Issue Created from changes
        'issue-assigned_wf_gT2iwLaRMx0kIFkr', // from screenshot URL
    ];

    for (const id of idsToTry) {
        console.log(`\n--- ID: ${id} ---`);
        const routes = [
            `/v1/notification-templates/${id}`,
            `/v1/workflows/${id}`
        ];

        for (const r of routes) {
            try {
                const res = await axios.get(`https://api.novu.co${r}`, {
                    headers: { 'Authorization': `ApiKey ${API_KEY}` }
                });
                console.log(`   ✅ SUCCESS on ${r}`);
                console.log(`      Name: ${res.data.data.name}`);
                console.log(`      Steps: ${res.data.data.steps.length}`);
            } catch (err) {
                console.log(`   ❌ FAILED on ${r}: ${err.message}`);
            }
        }
    }
}
main();
