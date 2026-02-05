
const axios = require('axios');

async function probeWorkflow(key, label, workflowId) {
    console.log(`\n--- Probing ${label} for Workflow ${workflowId} ---`);
    try {
        const res = await axios.get(`https://api.novu.co/v1/notification-templates/${workflowId}`, {
            headers: { 'Authorization': `ApiKey ${key}` }
        });
        console.log(`   ✅ Success! Name: ${res.data.data.name}`);
        console.log(`   Trigger: ${res.data.data.triggers[0].identifier}`);
    } catch (err) {
        console.error(`   ❌ Failed: ${err.message}`);
    }
}

async function main() {
    const ids = [
        '69831c4f93bdb65fcbf334ec',
        '69831c5042aa4e6cd1ca3958',
        '69831c50e2861b689db690ed',
        '69831c50e2861b689db6913c'
    ];

    for (const id of ids) {
        await probeWorkflow('84ec40b73ccba3e7205185bff4e00ffe', 'Key 1', id);
        await probeWorkflow('0e6ea8224d1faabe42f379cff81a2fc5', 'Key 2', id);
    }
}
main();
