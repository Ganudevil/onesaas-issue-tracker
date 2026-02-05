const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';
const novu = new Novu(API_KEY);

async function trigger() {
    console.log('🚀 Triggering manual test for issue-created-5q2w...');
    try {
        const result = await novu.trigger('issue-created-5q2w', {
            to: {
                subscriberId: 'ab914165-2c3b-4eff-b9c8-694a2ee019a0', // Real User ID (deviprasad)
                email: 'deviprasad@example.com',
                firstName: 'Deviprasad'
            },
            payload: {
                issueId: 'test-issue-created-manual',
                title: 'MANUAL TEST: Issue Created',
                priority: 'High',
                url: 'http://localhost:3000'
            }
        });
        console.log('✅ Trigger Successful:', JSON.stringify(result.data));
    } catch (error) {
        console.error('❌ Trigger Failed:', error.message);
        if (error.response) console.error(JSON.stringify(error.response.data));
    }
}

trigger();
