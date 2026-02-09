
const { Novu } = require('@novu/node');
const axios = require('axios');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const novu = new Novu(API_KEY);

async function fixIntegrations() {
    console.log('--- Fixing Production Integrations ---');
    try {
        const res = await novu.integrations.getAll();
        const integrations = res.data.data;

        // Target the specific Production Integration found: 69577e420528c5e13861fdaf
        const targetId = '69577e420528c5e13861fdaf';
        const inApp = integrations.find(i => i._id === targetId);

        if (!inApp) {
            console.error('❌ NO In-App Integration found!');
            return;
        }

        console.log(`Found In-App Integration: ${inApp._id}`);
        console.log(`Current Primary Status: ${inApp.primary}`);

        if (inApp.primary) {
            console.log('✅ Already Primary. No action needed.');
            return;
        }

        // Attempt to update to Primary
        console.log(`🚀 Updating to PRIMARY...`);
        // Using axios for direct control if SDK lacks update method easily reachable
        const updateRes = await axios.put(
            `https://api.novu.co/v1/integrations/${inApp._id}`,
            {
                primary: true,
                active: true,
                credentials: {}, // Required sometimes?
                channel: 'in_app',
                providerId: 'novu'
            },
            { headers: { 'Authorization': `ApiKey ${API_KEY}` } }
        );

        console.log('✅ Update Successful!');
        console.log('New Status:', updateRes.data.data.primary);

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
    }
}

fixIntegrations();
