
const axios = require('axios');
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';

async function main() {
    console.log('🔍 Inspecting Production "issue-created" workflow...');
    try {
        const res = await axios.get('https://api.novu.co/v1/notification-templates', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });

        const workflow = res.data.data.find(w => w.triggers[0].identifier === 'issue-created-5q2w');

        if (workflow) {
            console.log(`Found Workflow ID: ${workflow._id}`);
            // Fetch full details
            const fullRes = await axios.get(`https://api.novu.co/v1/notification-templates/${workflow._id}`, {
                headers: { 'Authorization': `ApiKey ${API_KEY}` }
            });
            const details = fullRes.data.data;

            console.log('\n--- In-App Step ---');
            const inAppStep = details.steps.find(s => s.template.type === 'in_app');
            if (inAppStep) {
                console.log('Content:', JSON.stringify(inAppStep.template.content));
                console.log('Variables:', inAppStep.template.variables);
            } else {
                console.log('No In-App step found!');
            }

            console.log('\n--- Email Step ---');
            const emailStep = details.steps.find(s => s.template.type === 'email');
            if (emailStep) {
                console.log('Subject:', emailStep.template.subject);
                console.log('Content (text):', JSON.stringify(emailStep.template.content));
            }
        } else {
            console.log('❌ "issue-created" workflow not found!');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response) console.log(JSON.stringify(err.response.data));
    }
}
main();
