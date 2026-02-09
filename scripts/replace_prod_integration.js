
const { Novu } = require('@novu/node');
const axios = require('axios');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const novu = new Novu(API_KEY);

async function replaceIntegration() {
    console.log('--- Replacing Production Integration ---');
    try {
        // 1. Find Existing
        const res = await novu.integrations.getAll();
        const integrations = res.data.data;
        const targetId = '69577e420528c5e13861fdaf'; // Confirmed Prod ID
        const existing = integrations.find(i => i._id === targetId);

        if (existing) {
            console.log(`Found Existing: ${existing._id}`);
            console.log(`Deleting...`);
            await axios.delete(`https://api.novu.co/v1/integrations/${existing._id}`, {
                headers: { 'Authorization': `ApiKey ${API_KEY}` }
            });
            console.log('✅ Deleted.');
        } else {
            console.log('⚠️ Previous integration not found (maybe already deleted).');
        }

        // 2. Create New
        console.log('Creating NEW Primary Integration...');
        const createRes = await axios.post(
            'https://api.novu.co/v1/integrations',
            {
                providerId: 'novu',
                channel: 'in_app',
                active: true,
                primary: true,
                credentials: {},
                check: false
            },
            { headers: { 'Authorization': `ApiKey ${API_KEY}` } }
        );

        console.log('✅ Creation Successful!');
        console.log(`New ID: ${createRes.data.data._id}`);
        console.log(`Primary: ${createRes.data.data.primary}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
    }
}

replaceIntegration();
