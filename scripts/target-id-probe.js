
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🎯 Targeted ID Probe starting...');

    // IDs extracted from the user's latest screenshot URL
    const workflowId = 'issue-assigned_wf_gT2iwLaRMx0kIFkr';
    const stepId = 'in-app-step_sl_gT2uVhO3JZUoDvcb';

    console.log(`URL Workflow ID: ${workflowId}`);

    const routes = [
        `/v1/workflows/${workflowId}`,
        `/v1/notification-templates/${workflowId}`,
        `/v1/notification-templates/69831c50e2861b689db6913c` // Internal ID from earlier changes dump
    ];

    for (const r of routes) {
        console.log(`\n--- Fetching: ${r} ---`);
        try {
            const res = await axios.get(`https://api.novu.co${r}`, {
                headers: { 'Authorization': `ApiKey ${API_KEY}` }
            });
            console.log(`   ✅ SUCCESS!`);
            console.log(`      Name: ${res.data.data.name}`);
            console.log(`      Steps: ${res.data.data.steps.length}`);
        } catch (err) {
            console.error(`   ❌ Failed: ${err.message}`);
            if (err.response) {
                console.log('   Data:', JSON.stringify(err.response.data));
            }
        }
    }
}
main();
