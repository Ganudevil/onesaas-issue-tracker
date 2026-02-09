
const { Novu } = require('@novu/node');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const novu = new Novu(API_KEY);

async function checkIntegrations() {
    console.log('--- Checking Production Integrations ---');
    try {
        const res = await novu.integrations.getAll();
        const integrations = res.data.data;

        console.log(`Found ${integrations.length} integrations.`);

        integrations.forEach(i => {
            console.log(`- Provider: ${i.providerId}`);
            console.log(`  Channel: ${i.channel}`);
            console.log(`  Active: ${i.active}`);
            console.log(`  Primary: ${i.primary}`);
        });

        const inApp = integrations.find(i => i.channel === 'in_app');
        if (!inApp) {
            console.error('❌ NO In-App Integration found!');
        } else if (!inApp.active) {
            console.error('❌ In-App Integration is INACTIVE!');
        } else {
            console.log('✅ In-App Integration is Active.');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

checkIntegrations();
