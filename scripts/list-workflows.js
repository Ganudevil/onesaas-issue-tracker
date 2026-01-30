const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));

async function listWorkflows() {
    const apiKey = process.argv[2];
    if (!apiKey) {
        console.error('Please provide API key');
        process.exit(1);
    }

    const novu = new Novu(apiKey);

    try {
        console.log('Fetching workflows...');

        let page = 0;
        let hasMore = true;

        while (hasMore) {
            const { data } = await novu.notificationTemplates.getAll(page, 20);

            if (data.data.length === 0) {
                hasMore = false;
                break;
            }

            console.log(`\nPage ${page} - Found ${data.data.length} workflows:`);
            console.log('----------------------------------------');

            data.data.forEach(wf => {
                const triggerId = wf.triggers[0]?.identifier;
                console.log(`ID: ${wf._id}`);
                console.log(`Name: ${wf.name}`);
                console.log(`Identifier: ${triggerId}`);
                console.log(`Active: ${wf.active}`);
                console.log('----------------------------------------');
            });
            page++;
        }

    } catch (error) {
        console.error('Error fetching workflows:', error.message);
    }
}

listWorkflows();
