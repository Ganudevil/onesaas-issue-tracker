const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';
const novu = new Novu(API_KEY);

async function trigger() {
    console.log('🚀 Testing issue-updated-q1m2 workflow...');
    try {
        const result = await novu.trigger('issue-updated-q1m2', {
            to: {
                subscriberId: 'ab914165-2c3b-4eff-b9c8-694a2ee019a0', // Real User ID
                email: 'test@example.com',
                firstName: 'Mihir'
            },
            payload: {
                issueId: 'test-update-123',
                title: 'Test Issue for Update Notification',
                changeType: 'Image deleted',
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
