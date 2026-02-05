
const { Novu } = require('@novu/node');
require('dotenv').config({ path: 'apps/backend/.env' });

async function main() {
    console.log('Testing Generic Update Trigger...');
    const API_KEY = process.env.NOVU_API_KEY || '0e6ea8224d1faabe42f379cff81a2fc5';
    const novu = new Novu(API_KEY);

    try {
        // Use a dummy subscriber ID that likely exists or create one
        // We'll use the one from previous tests if possible, or just a random one
        const subscriberId = 'test-user-1';

        const res = await novu.trigger('issue-updated', {
            to: { subscriberId },
            payload: {
                title: 'This is a Generic Update Test',
                issueId: 'test-id',
                url: 'https://test.com'
            }
        });

        console.log('Response:', JSON.stringify(res.data));
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) console.log(JSON.stringify(err.response.data));
    }
}
main();
