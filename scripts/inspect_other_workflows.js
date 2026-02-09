
const { Novu } = require('@novu/node');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const novu = new Novu(API_KEY);

async function inspectOtherWorkflows() {
    console.log('--- Inspecting Other Workflows ---');

    try {
        const workflows = await novu.notificationTemplates.getAll();

        const targets = ['issue-assigned', 'issue-updated', 'issue-status-changed'];

        for (const triggerId of targets) {
            const flow = workflows.data.data.find(w => w.triggers[0].identifier === triggerId);
            if (!flow) {
                console.log(`❌ Workflow "${triggerId}" NOT found.`);
                continue;
            }

            console.log(`\nChecking "${triggerId}" (${flow._id})...`);
            // Fetch full details
            const fullFlow = await novu.notificationTemplates.getOne(flow._id);

            fullFlow.data.steps.forEach((step, index) => {
                console.log(`   Step ${index + 1}: ${step.template.type}`);
                console.log(`   Content: "${step.template.content}"`);
                console.log(`   Variables:`, step.template.variables?.map(v => v.name));
            });
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

inspectOtherWorkflows();
