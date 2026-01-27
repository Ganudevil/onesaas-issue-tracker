const { Novu } = require('@novu/node');
require('dotenv').config();

const API_KEY = process.env.NOVU_API_KEY;

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
        const response = await novu.trigger('issue-created', {
            to: {
                subscriberId: subscriberId
            },
            payload: {
                issueId: "123",
                title: "Test Issue Title",
                url: "http://localhost:3000",
                tenantId: "tenant1"
            }
        });

        console.log("Trigger response:", JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error("Error triggering notification:", error);
    }
}

testTrigger();
