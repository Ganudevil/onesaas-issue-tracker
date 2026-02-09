const { Novu } = require('@novu/node');
const axios = require('axios');

const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const novu = new Novu(API_KEY);

async function tryAllMethods() {
    console.log('--- Final Comprehensive Attempt to Set Primary ---');

    try {
        // 1. Get current integration
        const res = await novu.integrations.getAll();
        const inApp = res.data.data.find(i => i.channel === 'in_app' && i.providerId === 'novu');

        if (!inApp) {
            console.error('❌ No In-App integration found!');
            return;
        }

        console.log(`Target Integration: ${inApp._id}`);
        console.log(`Current Primary: ${inApp.primary}\n`);

        // METHOD 1: SDK Update (if exists)
        console.log('METHOD 1: Trying SDK update method...');
        try {
            if (novu.integrations.update) {
                const sdkRes = await novu.integrations.update(inApp._id, {
                    active: true,
                    primary: true
                });
                console.log('SDK Result:', sdkRes.data.data.primary);
            } else {
                console.log('SDK update method not available.');
            }
        } catch (e) {
            console.log('SDK method failed:', e.message);
        }

        // METHOD 2: PATCH Request
        console.log('\nMETHOD 2: Trying PATCH request...');
        try {
            const patchRes = await axios.patch(
                `https://api.novu.co/v1/integrations/${inApp._id}`,
                { primary: true },
                { headers: { 'Authorization': `ApiKey ${API_KEY}` } }
            );
            console.log('PATCH Result:', patchRes.data.data.primary);
        } catch (e) {
            console.log('PATCH failed:', e.response?.status, e.response?.data?.message || e.message);
        }

        // METHOD 3: PUT with minimal payload
        console.log('\nMETHOD 3: Trying PUT with minimal payload...');
        try {
            const putRes = await axios.put(
                `https://api.novu.co/v1/integrations/${inApp._id}`,
                {
                    _environmentId: inApp._environmentId,
                    providerId: 'novu',
                    channel: 'in_app',
                    active: true,
                    primary: true
                },
                { headers: { 'Authorization': `ApiKey ${API_KEY}` } }
            );
            console.log('PUT Result:', putRes.data.data.primary);
        } catch (e) {
            console.log('PUT failed:', e.response?.status, e.response?.data?.message || e.message);
        }

        // METHOD 4: Set as Active endpoint (if exists)
        console.log('\nMETHOD 4: Trying /active endpoint...');
        try {
            const activeRes = await axios.post(
                `https://api.novu.co/v1/integrations/${inApp._id}/active`,
                {},
                { headers: { 'Authorization': `ApiKey ${API_KEY}` } }
            );
            console.log('Active endpoint result:', activeRes.data);
        } catch (e) {
            console.log('Active endpoint failed:', e.response?.status, e.response?.data?.message || e.message);
        }

        // FINAL CHECK
        console.log('\n--- Final State Check ---');
        const finalRes = await novu.integrations.getAll();
        const finalInApp = finalRes.data.data.find(i => i.channel === 'in_app' && i.providerId === 'novu');
        console.log(`Final Primary Status: ${finalInApp.primary}`);

        if (finalInApp.primary) {
            console.log('\n✅✅✅ SUCCESS! Integration is now Primary! ✅✅✅');
        } else {
            console.log('\n❌ All methods failed. Manual Dashboard action required.');
        }

    } catch (err) {
        console.error('Fatal error:', err.message);
    }
}

tryAllMethods();
