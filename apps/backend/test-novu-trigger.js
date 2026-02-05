const { Novu } = require('@novu/node');
require('dotenv').config();

const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';

if (!API_KEY) {
    console.error("NOVU_API_KEY not found");
    process.exit(1);
}

const novu = new Novu(API_KEY);

async function testTrigger() {
    console.log("Testing Novu Trigger...");

    // Using a hardcoded subscriber ID that looked valid from screenshot, or a new fake one
    const subscriberId = "test-user-123";

    try {
        console.log("Identifying subscriber...");
        await novu.subscribers.identify(subscriberId, {
            email: "test@example.com",
            firstName: "Test User"
        });

        console.log("Triggering event...");
        const eventName = 'issue-updated';
        const response = await novu.trigger(eventName, {
            to: {
                subscriberId: subscriberId
            },
            payload: {
                issueId: 'test-generic-123',
                title: 'Test Issue Title - Generic Update',
                url: 'https://frontend.com'
            }
        });

        console.log("Trigger response:", JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error("Error triggering notification:", error);
    }
}

testTrigger();
