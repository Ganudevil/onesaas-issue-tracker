const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));

async function getAppId() {
    const apiKey = process.argv[2];
    if (!apiKey) {
        console.error('Please provide API key');
        process.exit(1);
    }

    const novu = new Novu(apiKey);

    try {
        console.log('Fetching environment info...');
        const { data } = await novu.environments.getCurrent();

        console.log(`\nEnvironment: ${data.data.name}`);
        console.log(`App ID: ${data.data.identifier}`);
        console.log(`API Key: ${data.data.apiKeys[0].key}`);

    } catch (error) {
        console.error('Error fetching environment:', error.message);
    }
}

getAppId();
