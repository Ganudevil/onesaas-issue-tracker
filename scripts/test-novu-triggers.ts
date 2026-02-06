/**
 * Test script to manually trigger Novu notifications
 * Run with: npx ts-node scripts/test-novu-triggers.ts
 */

import { Novu } from '@novu/node';

const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5'; // Production Key from your environment
const novu = new Novu(API_KEY);

const subscriberId = '550e8400-e29b-41d4-a716-446655440000'; // Example UUID - REPLACE with your actual UUID from Keycloak/DB if needed
const subscriberEmail = 'admin@onesaas.com';

async function testTriggers() {
    console.log('🚀 Starting Novu Trigger Test...');
    console.log(`Target Subscriber: ${subscriberId} (${subscriberEmail})`);

    try {
        // 1. Ensure subscriber exists
        console.log('\n1️⃣ identifying subscriber...');
        await novu.subscribers.identify(subscriberId, {
            email: subscriberEmail,
            firstName: 'Test User',
        });
        console.log('✅ Subscriber identified');

        // 2. Trigger "Issue Created"
        console.log('\n2️⃣ Triggering "Issue Created"...');
        await novu.trigger('issue-created', {
            to: {
                subscriberId: subscriberId,
            },
            payload: {
                title: 'Test Issue 001',
                description: 'This is a test description from the manual trigger script.',
                priority: 'high',
                url: 'https://frontend-three-brown-95.vercel.app',
                issueId: 'test-issue-id-123'
            },
        });
        console.log('✅ "Issue Created" triggered');

        // 3. Trigger "Issue Assigned"
        console.log('\n3️⃣ Triggering "Issue Assigned"...');
        await novu.trigger('issue-assigned', {
            to: {
                subscriberId: subscriberId,
            },
            payload: {
                title: 'Test Issue 001',
                description: 'This is a test description.',
                url: 'https://frontend-three-brown-95.vercel.app',
                issueId: 'test-issue-id-123'
            },
        });
        console.log('✅ "Issue Assigned" triggered');

        // 4. Trigger "Comment Added"
        console.log('\n4️⃣ Triggering "Comment Added"...');
        await novu.trigger('comment-added', {
            to: {
                subscriberId: subscriberId,
            },
            payload: {
                issueTitle: 'Test Issue 001',
                comment: 'This is a test comment.',
                url: 'https://frontend-three-brown-95.vercel.app',
                issueId: 'test-issue-id-123'
            },
        });
        console.log('✅ "Comment Added" triggered');

        // 5. Trigger "Issue Updated"
        console.log('\n5️⃣ Triggering "Issue Updated"...');
        await novu.trigger('issue-updated', {
            to: {
                subscriberId: subscriberId,
            },
            payload: {
                issueId: 'test-issue-id-123',
                title: 'Test Issue 001',
                changeType: 'Priority updated',
                url: 'https://frontend-three-brown-95.vercel.app'
            },
        });
        console.log('✅ "Issue Updated" triggered');


        console.log('\n✨ All triggers sent successfully!');
        console.log('👉 Check your frontend bell icon. You should see 4 new notifications.');

    } catch (error) {
        console.error('\n❌ Error triggering notifications:', error);
    }
}

testTriggers();
