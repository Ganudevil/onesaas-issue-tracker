const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';
const novu = new Novu(API_KEY);

const SUBSCRIBER_ID = 'TEST-SUBSCRIBER-1'; // Reverted from real user ID

async function triggerAll() {
    console.log(`🚀 Triggering ALL 4 workflows for Subscriber: ${SUBSCRIBER_ID} ...\n`);

    const workflows = [
        {
            id: 'issue-created-5q2w',
            payload: { issueId: 'test-1', title: 'Test Issue Created', priority: 'High', url: 'http://localhost' }
        },
        {
            id: 'issue-assigned-rqdp',
            payload: { issueId: 'test-2', title: 'Test Issue Assigned', url: 'http://localhost' }
        },
        {
            id: 'issue-status-changed-i6e1',
            payload: { issueId: 'test-3', title: 'Test Status Change', status: 'Done', url: 'http://localhost' }
        },
        {
            id: 'comment-added-44gh',
            payload: { issueId: 'test-4', issueTitle: 'Test Comment Issue', comment: 'This is a test comment', url: 'http://localhost' }
        }
    ];

    for (const wf of workflows) {
        try {
            console.log(`👉 Triggering ${wf.id}...`);
            await novu.trigger(wf.id, {
                to: { subscriberId: SUBSCRIBER_ID },
                payload: wf.payload
            });
            console.log(`   ✅ Success`);
        } catch (error) {
            console.error(`   ❌ Failed: ${error.message}`);
        }
        // Small delay
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log('\n✨ All triggers returned. Check Novu Inbox.');
}

triggerAll();
