
const { Novu } = require('@novu/node');

// Try to load env from various places if possible, or expect user to have them set
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const API_KEY = process.env.NOVU_API_KEY || '84ec40b73ccba3e7205185bff4e00ffe';

if (!API_KEY) {
    console.error('Error: NOVU_API_KEY is missing from environment variables.');
    console.error('Please creating a .env file or set result in terminal.');
    process.exit(1);
}

const novu = new Novu(API_KEY);

async function checkNovu() {
    console.log('--- Checking Novu Configuration ---');
    try {
        const me = await novu.environments.getCurrent();
        console.log('Environment:', me.data.name);
        console.log('App Identifier:', me.data.identifier);

        console.log('\n--- Checking Workflows ---');
        const workflows = await novu.notificationTemplates.getAll();
        const triggers = workflows.data.data.map(w => w.triggers[0].identifier);
        console.log('Found Workflows:', triggers);

        const commentWorkflow = workflows.data.data.find(w => w.triggers[0].identifier === 'comment-added');
        if (commentWorkflow) {
            console.log('✅ Workflow "comment-added" exists.');
            console.log('   ID:', commentWorkflow._id);
            console.log('   Active:', commentWorkflow.active);
        } else {
            console.error('❌ Workflow "comment-added" NOT found!');
            console.log('   Available triggers:', triggers.join(', '));
        }

    } catch (error) {
        console.error('Error connecting to Novu:', error.message);
    }
}

checkNovu();
