
const { Novu } = require('@novu/node');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const novu = new Novu(API_KEY);

async function inspectIntegrations() {
    console.log('--- Inspecting Production Integrations (Detailed) ---');
    try {
        const res = await novu.integrations.getAll();
        const integrations = res.data.data.filter(i => i.channel === 'in_app');

        console.log(`Found ${integrations.length} In-App integrations.`);

        integrations.forEach((i, idx) => {
            console.log(`\n[${idx + 1}] ID: ${i._id}`);
            console.log(`    Provider: ${i.providerId}`);
            console.log(`    Active: ${i.active}`);
            console.log(`    Primary: ${i.primary}`);
            console.log(`    Identifier: ${i.identifier}`);
            console.log(`    Environment ID: ${i._environmentId}`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

inspectIntegrations();
