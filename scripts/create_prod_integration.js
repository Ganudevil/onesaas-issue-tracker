
const { Novu } = require('@novu/node');
const axios = require('axios');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const novu = new Novu(API_KEY);

async function createIntegration() {
    console.log('--- Creating New In-App Integration ---');
    try {
        const res = await axios.post(
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
        console.log(`new Integration ID: ${res.data.data._id}`);
        console.log(`Primary: ${res.data.data.primary}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
    }
}

createIntegration();
