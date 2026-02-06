const https = require('https');

const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

// We SKIP 'Issue Created' as user said it works.
const TARGETS = [
    {
        name: 'Comment Added',
        content: '{{firstName}} commented: {{payload.comment}}'
    },
    {
        name: 'Issue Assigned',
        content: 'You were assigned to {{payload.title}}'
    },
    {
        name: 'Issue Updated',
        content: 'Issue updated: {{payload.title}}'
    },
    {
        name: 'Issue Status Changed',
        content: 'Status changed to {{payload.status}}: {{payload.title}}'
    }
];

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.novu.co',
            path: '/v1' + path,
            method: method,
            headers: {
                'Authorization': `ApiKey ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(json);
                    } else {
                        reject({ status: res.statusCode, body: json });
                    }
                } catch (e) {
                    reject({ status: res.statusCode, error: e, raw: data });
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    try {
        console.log('--- STARTING WORKFLOW REPAIR ---');

        // 1. Fetch Workflows
        const workflows = (await request('GET', '/workflows?limit=100')).data;
        console.log(`Found ${workflows.length} total workflows.`);

        // 2. Delete Broken/Duplicate Targets
        for (const target of TARGETS) {
            const matches = workflows.filter(w => w.name.toLowerCase() === target.name.toLowerCase());
            for (const m of matches) {
                console.log(`Deleting existing: "${m.name}" (ID: ${m._id} | Trigger: ${m.triggers[0]?.identifier})`);
                try {
                    await request('DELETE', `/workflows/${m._id}`);
                } catch (e) {
                    // Ignore 404 if already deleted
                    if (e.status === 404) {
                        console.log(`⚠️ Workflow ${m._id} already deleted (404), continuing...`);
                    } else {
                        console.error(`Failed to delete ${m._id}:`, e.body || e);
                    }
                }
            }
        }

        // 3. Create & Test New Ones
        // We need a Notification Group ID
        const groups = (await request('GET', '/notification-groups')).data;
        const groupId = groups[0]._id;

        const results = {};

        for (const target of TARGETS) {
            console.log(`\nCreating "${target.name}"...`);

            const payload = {
                name: target.name,
                notificationGroupId: groupId,
                steps: [
                    {
                        template: {
                            type: 'in_app',
                            content: target.content
                        },
                        active: true
                    }
                ],
                active: true,
                draft: false,
                tags: ['verified-dashboard']
            };

            const created = (await request('POST', '/workflows', payload)).data;
            const triggerId = created.triggers[0].identifier;
            console.log(`✅ Created. New Trigger ID: ${triggerId}`);
            results[target.name] = triggerId;

            // 4. TEST TRIGGER (To prove it's not a Bridge workflow)
            console.log(`🧪 Testing trigger for ${triggerId}...`);
            try {
                await request('POST', '/events/trigger', {
                    name: triggerId,
                    to: {
                        subscriberId: 'test-repair-user',
                        firstName: 'Test',
                        lastName: 'User'
                    },
                    payload: {
                        title: 'Test Issue',
                        comment: 'This is a test comment from repair script',
                        status: 'Testing'
                    }
                });
                console.log(`🎉 Test Trigger SUCCESS (No Bridge Error)`);
            } catch (e) {
                console.error(`❌ Test Trigger FAILED:`, e.body || e);
            }
        }

        console.log('\n--- FINAL TRIGGER IDs (Copy to issues.service.ts) ---');
        console.log(JSON.stringify(results, null, 2));

    } catch (e) {
        console.error('Fatal error:', e);
    }
}

main();
