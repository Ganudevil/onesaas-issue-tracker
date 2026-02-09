const { Novu } = require('@novu/node');

const DEV_KEY = '84ec40b73ccba3e7205185bff4e00ffe';
const PROD_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';

async function checkBothEnvs() {
    console.log('--- Checking Both Environments ---\n');

    // Check Dev
    const devNovu = new Novu(DEV_KEY);
    const devRes = await devNovu.integrations.getAll();
    const devInApp = devRes.data.data.find(i => i.channel === 'in_app');

    console.log('DEVELOPMENT:');
    console.log(`  Integration ID: ${devInApp?._id}`);
    console.log(`  Primary: ${devInApp?.primary}`);
    console.log(`  Active: ${devInApp?.active}\n`);

    // Check Prod
    const prodNovu = new Novu(PROD_KEY);
    const prodRes = await prodNovu.integrations.getAll();
    const prodInApp = prodRes.data.data.find(i => i.channel === 'in_app');

    console.log('PRODUCTION:');
    console.log(`  Integration ID: ${prodInApp?._id}`);
    console.log(`  Primary: ${prodInApp?.primary}`);
    console.log(`  Active: ${prodInApp?.active}\n`);

    if (devInApp?.primary) {
        console.log('✅ Dev has Primary! We could switch frontend to use Dev temporarily.');
    }
    if (prodInApp?.primary) {
        console.log('✅ Prod has Primary! Should be working.');
    }
    if (!devInApp?.primary && !prodInApp?.primary) {
        console.log('❌ Neither environment has Primary set. Manual action absolutely required.');
    }
}

checkBothEnvs().catch(console.error);
