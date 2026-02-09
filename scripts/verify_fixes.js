
const { Novu } = require('@novu/node');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const novu = new Novu(API_KEY);

async function verifyFixes() {
    console.log('--- Verifying Workflow Fixes ---');
    const targetSubscriberId = '1e694fab-a7e1-402b-bacb-16646592eb5b'; // Admin

    try {
        console.log(`\nAttempting MANUAL trigger for "issue-assigned" to ${targetSubscriberId}...`);

        const triggerRes = await novu.trigger('issue-assigned', {
            to: { subscriberId: targetSubscriberId },
            payload: {
                issueId: 'verify-fix-123',
                title: 'Verification Issue',
                description: 'This is a test to verify notification fixes.',
                url: 'https://frontend-three-brown-95.vercel.app/issues/verify-fix-123'
            }
        });

        console.log('✅ Trigger sent!');
        console.log('Transaction ID:', triggerRes.data.data.transactionId);

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
    }
}

verifyFixes();
