
const { Novu } = require('../apps/backend/node_modules/@novu/node');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    const novu = new Novu(API_KEY);
    console.log('🚀 Triggering Dummy Notification...');

    try {
        const res = await novu.trigger('issue-created', {
            to: {
                subscriberId: 'dummy_check_v1',
                email: 'dummy@example.com'
            },
            payload: {
                title: 'Check Existence',
                priority: 'High',
                url: 'https://example.com'
            }
        });
        console.log('Status:', res.status);
        console.log('Data:', JSON.stringify(res.data));
    } catch (err) {
        console.error('❌ Trigger Failed:', err.message);
        if (err.response) console.error('Data:', JSON.stringify(err.response.data));
    }
}
main();
