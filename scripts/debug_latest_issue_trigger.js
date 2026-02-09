const { Novu } = require('@novu/node');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Configuration
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const DB_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6MPO5vQxVziq@ep-jolly-mountain-a513gu46-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

const novu = new Novu(API_KEY);
const pool = new Pool({ connectionString: DB_URL });

async function debugTrigger() {
    console.log('--- Debugging Novu Environment ---');
    try {
        const me = await novu.environments.getCurrent();
        console.log('Environment Object:', JSON.stringify(me.data, null, 2));
    } catch (e) {
        console.error('Failed to fetch environment:', e.message);
    }

    console.log('\n--- Debugging Novu Subscribers ---');

    try {
        // 1. List Recent Subscribers
        console.log('Listing recent subscribers...');
        const subs = await novu.subscribers.list(0, 5); // Page 0, Limit 5

        if (subs.data.data.length === 0) {
            console.log('❌ No subscribers found in Novu.');
            return;
        }

        console.log(`✅ Found ${subs.data.data.length} subscribers:`);
        subs.data.data.forEach(s => {
            console.log(`- ID: ${s.subscriberId}, Email: ${s.email}, Name: ${s.firstName}`);
        });

        // 2. Target specific subscriber (Admin from screenshot)
        const targetSubscriberId = '1e694fab-a7e1-402b-bacb-16646592eb5b';
        console.log(`\nTargeting Subscriber: ${targetSubscriberId}...`);

        // Check Workflow Details
        console.log('Checking "issue-created" workflow details...');
        const workflows = await novu.notificationTemplates.getAll();
        const issueCreatedFlow = workflows.data.data.find(w => w.triggers[0].identifier === 'issue-created');

        if (issueCreatedFlow) {
            console.log('✅ Workflow found.');
            console.log('   Active:', issueCreatedFlow.active);
            console.log('   Steps:', issueCreatedFlow.steps.map(s => s.template.type).join(' -> '));
        } else {
            console.error('❌ Workflow "issue-created" NOT found.');
        }

        // 3. Try Manual Trigger
        console.log('\nAttempting MANUAL trigger for "issue-created"...');
        try {
            const triggerRes = await novu.trigger('issue-created', {
                to: { subscriberId: targetSubscriberId },
                payload: {
                    issueId: 'debug-issue-123',
                    title: 'Test Issue (Script)',
                    description: 'Debug trigger',
                    priority: 'high',
                    url: 'https://frontend-three-brown-95.vercel.app/issues/debug-issue-123'
                }
            });
            console.log('✅ Trigger sent successfully!');
            console.log('Transaction ID:', triggerRes.data.data.transactionId);
        } catch (err) {
            console.error('❌ Trigger FAILED:', err.message);
            if (err.response?.data) console.error(JSON.stringify(err.response.data));
        }

    } catch (err) {
        console.error('Script Error:', err);
    }
}

debugTrigger();
