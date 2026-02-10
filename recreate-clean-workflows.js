const https = require('https');

const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe'; // Hardcoded for this environment
const BASE_URL = 'https://api.novu.co/v1';

const TARGETS = [
    {
        id: 'comment-added',
        name: 'Comment Added',
        // Note: New Novu requirements might need steps properly formatted. 
        // We use In-App step.
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: '{{firstName}} commented: {{payload.comment}}',
                    cta: {
                        action: {
                            url: '/issues/{{payload.issueId}}'
                        }
                    }
                },
                active: true
            }
        ]
    },
    {
        id: 'issue-assigned',
        name: 'Issue Assigned',
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: 'You were assigned to {{payload.title}}',
                    cta: {
                        action: {
                            url: '/issues/{{payload.issueId}}'
                        }
                    }
                },
                active: true
            }
        ]
    },
    {
        id: 'issue-updated',
        name: 'Issue Updated',
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: 'Issue updated: {{payload.title}}',
                    cta: {
                        action: {
                            url: '/issues/{{payload.issueId}}'
                        }
                    }
                },
                active: true
            }
        ]
    },
    {
        id: 'issue-status-changed',
        name: 'Issue Status Changed',
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: 'Status of {{payload.title}} changed to {{payload.status}}',
                    cta: {
                        action: {
                            url: '/issues/{{payload.issueId}}'
                        }
                    }
                },
                active: true
            }
        ]
    },
    {
        id: 'issue-created',
        name: 'Issue Created',
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: 'New Issue Created: {{payload.title}}',
                    cta: {
                        action: {
                            url: '/issues/{{payload.issueId}}'
                        }
                    }
                },
                active: true
            }
        ]
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
        console.log('Fetching existing workflows...');
        const response = await request('GET', '/workflows?limit=100');
        const workflows = response.data;
        console.log(`Found ${workflows.length} workflows.`);

        const groupsRes = await request('GET', '/notification-groups');
        const groupId = groupsRes.data[0]._id;

        // 1. Delete ALL Workflows that match our target IDs or names to ensure clean slate
        for (const target of TARGETS) {
            const toDelete = workflows.filter(w => {
                const triggerId = w.triggers[0]?.identifier;
                return triggerId === target.id ||
                    triggerId.startsWith(target.id + '-') ||
                    w.name.toLowerCase() === target.name.toLowerCase();
            });

            for (const wf of toDelete) {
                console.log(`Deleting incompatible workflow: ${wf.name} (${wf._id})`);
                try {
                    await request('DELETE', `/workflows/${wf._id}`);
                } catch (e) {
                    console.error(`Failed to delete ${wf._id}:`, e.body || e);
                }
            }
        }

        console.log('Waiting 5s for deletion to propagate...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 2. Create Fresh Workflows
        for (const target of TARGETS) {
            console.log(`Creating fresh workflow: ${target.name} (${target.id})...`);

            const payload = {
                name: target.name,
                identifier: target.id, // Try to force it
                customIdentifier: target.id, // Legacy/Alternative
                notificationGroupId: groupId,
                steps: target.steps,
                active: true,
                draft: false,
                tags: ['fixed-by-assistant-v3']
            };

            try {
                const created = await request('POST', '/workflows', payload);
                const createdTrigger = created.data.triggers[0].identifier;
                console.log(`Created ${target.name}. Trigger: ${createdTrigger}`);

                // If trigger doesn't match, we might need to recreate backend logic or accept it.
                if (createdTrigger !== target.id) {
                    console.warn(`WARNING: Trigger mismatch! Expected ${target.id}, got ${createdTrigger}`);
                }
            } catch (e) {
                console.error(`Failed to create ${target.name}:`, e.body || e);
            }
        }

        console.log('✅ Workflow recreation complete.');

    } catch (e) {
        console.error('Fatal error:', e);
    }
}

main();
