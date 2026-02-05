
const axios = require('axios');
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';

async function main() {
    console.log('🔍 Inspecting ALL Production Workflows Content...');
    try {
        const res = await axios.get('https://api.novu.co/v1/notification-templates', {
            headers: { 'Authorization': `ApiKey ${API_KEY}` }
        });

        const workflows = res.data.data;

        for (const w of workflows) {
            console.log(`\n--------------------------------------------------`);
            console.log(`Name: ${w.name}`);
            console.log(`Trigger: ${w.triggers[0].identifier}`);
            console.log(`ID: ${w._id}`);

            // Fetch full details
            try {
                const fullRes = await axios.get(`https://api.novu.co/v1/notification-templates/${w._id}`, {
                    headers: { 'Authorization': `ApiKey ${API_KEY}` }
                });
                const details = fullRes.data.data;
                const inAppStep = details.steps.find(s => s.template.type === 'in_app');

                if (inAppStep) {
                    console.log(`[In-App Content]: ${inAppStep.template.content}`);
                } else {
                    console.log(`[In-App Content]: (None)`);
                }
            } catch (e) {
                console.error(`Failed to fetch details: ${e.message}`);
            }
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
main();
