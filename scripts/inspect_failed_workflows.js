
const { Novu } = require('@novu/node');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const novu = new Novu(API_KEY);

async function inspectWorkflows() {
    console.log('--- Inspecting Failing Workflows ---');

    // Workflow identifiers to check
    const ids = ['comment-added', 'issue-assigned', 'issue-status-changed'];

    try {
        const workflows = await novu.notificationTemplates.getAll();

        for (const id of ids) {
            const flow = workflows.data.data.find(w => w.triggers[0].identifier === id);

            if (!flow) {
                console.log(`❌ Workflow "${id}" NOT found.`);
                continue;
            }

            console.log(`\n🔍 Analyzing "${id}" (${flow._id})...`);

            // Fetch full details
            const fullFlow = await novu.notificationTemplates.getOne(flow._id);

            console.log(`   Name: ${fullFlow.data.name}`);
            console.log(`   Steps: ${fullFlow.data.steps.length}`);

            fullFlow.data.steps.forEach((step, index) => {
                console.log(`   [Step ${index + 1}] Type: ${step.template.type}`);
                console.log(`       Content: ${JSON.stringify(step.template.content)}`);
                if (step.template.cta) {
                    console.log(`       CTA: ${JSON.stringify(step.template.cta)}`);
                }
                if (step.template.variables) {
                    console.log(`       Variables: ${step.template.variables.map(v => v.name).join(', ')}`);
                }
            });
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

inspectWorkflows();
