const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';
const novu = new Novu(API_KEY);

async function trigger() {
    console.log('🚀 Triggering manual test for issue-assigned-rqdp...');
    try {
        const result = await novu.trigger('issue-assigned-rqdp', {
            to: {
                subscriberId: 'TEST-SUBSCRIBER-1',
                email: 'test@example.com',
                firstName: 'Test User'
            },
            payload: {
                issueId: 'test-issue-id',
                title: 'Test Issue Title',
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
