
const { Novu } = require('@novu/node');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const novu = new Novu(API_KEY);

async function debugCommentWorkflow() {
    console.log('--- Debugging "comment-added" Workflow ---');

    try {
        // 1. Get Specific Workflow Details (Full)
        const workflowId = '69832cd03b2cc7778d500639'; // Comment Added ID
        console.log(`Fetching full details for workflow: ${workflowId}...`);

        const fullFlow = await novu.notificationTemplates.getOne(workflowId);

        console.log('✅ Workflow Response:', JSON.stringify(fullFlow.data, null, 2));

        /*
        console.log('✅ Workflow found:', fullFlow.data.name);
        console.log('   Triggers:', fullFlow.data.triggers[0].identifier);
        
        console.log('\n--- Steps Configuration ---');
        fullFlow.data.steps.forEach((step, index) => {
            console.log(`Step ${index + 1}: ${step.template.type}`);
            console.log(`   Content:`, step.template.content);
            console.log(`   Variables:`, step.template.variables);
        });
        */

        // 2. Try Manual Trigger with EXACT payload from backend code
        // Based on issues.service.ts:
        /*
          payload: {
            issueId: issue.id,
            issueTitle: issue.title,
            comment: text,
            url: ...
          }
        */
        const targetSubscriberId = '1e694fab-a7e1-402b-bacb-16646592eb5b'; // Admin ID from previous logs
        console.log(`\nAttempting MANUAL trigger for "comment-added" to ${targetSubscriberId}...`);

        const payload = {
            issueId: 'debug-issue-999',
            issueTitle: 'Debug Comment Issue',
            comment: 'This is a debug comment from script.',
            url: 'https://frontend-three-brown-95.vercel.app/issues/debug-issue-999'
        };

        const triggerRes = await novu.trigger('comment-added', {
            to: { subscriberId: targetSubscriberId },
            payload: payload
        });

        console.log('✅ Trigger sent!');
        console.log('Transaction ID:', triggerRes.data.data.transactionId);

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
    }
}

debugCommentWorkflow();
