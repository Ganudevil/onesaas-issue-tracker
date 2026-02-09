
const { Novu } = require('@novu/node');
const axios = require('axios');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const novu = new Novu(API_KEY);

async function activateIntegration() {
    console.log('--- Activating New Integration ---');
    try {
        const targetId = '698a0e5eaa033f429cf5ce1fc'; // New ID from output
        console.log(`Target: ${targetId}`);

        const updateRes = await axios.put(
            `https://api.novu.co/v1/integrations/${targetId}`,
            {
                primary: true,
                active: true,
                credentials: {},
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

activateIntegration();
