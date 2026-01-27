require('dotenv').config();
const axios = require('axios'); // Assuming axios is available or using https
const https = require('https');

const API_KEY = process.env.NOVU_API_KEY;
if (!API_KEY) {
    console.error('❌ Error: NOVU_API_KEY is missing in .env');
    process.exit(1);
}

const API_URL = 'https://api.novu.co/v1';

const workflows = [
    {
        name: 'Issue Created V3',
        triggerIdentifier: 'issue-created-v3',
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: 'New Issue Created: {{title}}'
                }
            }
        ]
    },
    {
        name: 'Issue Status Changed',
        triggerIdentifier: 'issue-status-changed',
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: 'Status Updated: {{title}} -> {{status}}'
                }
            }
        ]
    },
    {
        name: 'Issue Assigned',
        triggerIdentifier: 'issue-assigned',
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: 'You have been assigned to: {{title}}'
                }
            }
        ]
    },
    {
        name: 'Comment Added',
        triggerIdentifier: 'comment-added',
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: 'New Comment on {{issueTitle}}'
                }
            }
        ]
    }
];

// Helper to make HTTP requests
function request(method, path, data = null) {
    return new Promise((resolve, reject) => {
        // Ensure API_URL doesn't end with / and path starts with /
        const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
        const endpoint = path.startsWith('/') ? path : `/${path}`;
        const urlStr = `${baseUrl}${endpoint}`;
        const url = new URL(urlStr);

        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `ApiKey ${API_KEY}`
            }
        };

        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(body || '{}'));
                } else {
                    reject({ statusCode: res.statusCode, body: body });
                }
            });
        });

        req.on('error', (err) => reject(err));
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function main() {
    console.log('🚀 Starting Novu Workflow Configuration...');

    try {
        // 1. Get existing integration for In-App (required for step creation)
        // Actually, creating a workflow usually defaults to active integrations.
        // But we need the 'notificationGroupId'. fetching one first.
        const groups = await request('GET', '/notification-groups');
        const groupId = groups.data[0]._id;
        console.log(`✅ Using Notification Group: ${groups.data[0].name} (${groupId})`);

        // 2. Fetch existing workflows to avoid duplicates
        const existingRes = await request('GET', '/notification-templates?page=0&limit=100');
        const existingWorkflows = existingRes.data || [];

        for (const wf of workflows) {
            const exists = existingWorkflows.find(e => e.triggers[0].identifier === wf.triggerIdentifier);

            if (exists) {
                console.log(`⚠️ Workflow "${wf.name}" already exists. Skipping.`);
                // Could update, but skipping for safety as per instructions "Create..."
            } else {
                console.log(`Creating Workflow: ${wf.name}...`);
                const createRes = await request('POST', '/notification-templates', {
                    name: wf.name,
                    notificationGroupId: groupId,
                    tags: ['onesaas'],
                    description: 'Created by Antigravity Agent',
                    steps: wf.steps.map(s => ({
                        template: {
                            type: s.template.type,
                            content: s.template.content
                        },
                        active: true
                    })),
                    triggers: [{ identifier: wf.triggerIdentifier, type: 'event' }],
                    active: true,
                    draft: false
                });
                console.log(`✅ Created: ${wf.name} (ID: ${createRes.data._id})`);

                // VERIFY ACTUAL IDENTIFIER
                const verifyRes = await request('GET', `/notification-templates/${createRes.data._id}`);
                const actualTrigger = verifyRes.data.triggers[0].identifier;
                console.log(`🔍 Actual Trigger Identifier for "${wf.name}": "${actualTrigger}"`);

                // Update wf object for testing if needed, though we test with intended one usually.
                // But if they differ, test will fail.
                if (actualTrigger !== wf.triggerIdentifier) {
                    console.error(`⚠️ MISMATCH: Requested "${wf.triggerIdentifier}", got "${actualTrigger}"`);
                }
            }

            // 3. Test Trigger
            console.log(`👉 Testing Trigger: ${wf.triggerIdentifier}...`);
            await request('POST', '/events/trigger', {
                name: wf.triggerIdentifier,
                to: { subscriberId: 'test-user', firstName: 'Test', lastName: 'User' },
                payload: {
                    title: 'Test Issue',
                    priority: 'HIGH',
                    status: 'OPEN',
                    issueId: '123',
                    issueTitle: 'Test Issue',
                    comment: 'This is a test comment',
                    assignedTo: 'Test User'
                }
            });
            console.log(`🎉 Triggered successfully: ${wf.triggerIdentifier}`);
        }

        console.log('✨ All configurations and tests completed!');

    } catch (err) {
        console.error('❌ Error details:', err);
    }
}

main();
