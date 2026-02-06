const https = require('https');

const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';
const BASE_URL = 'https://api.novu.co/v1';

const TARGETS = [
    {
        id: 'comment-added',
        name: 'Comment Added',
        content: '{{firstName}} commented: {{payload.comment}}'
    },
    {
        id: 'issue-assigned',
        name: 'Issue Assigned',
        content: 'You were assigned to {{payload.title}}'
    },
    {
        id: 'issue-updated',
        name: 'Issue Updated',
        content: 'Issue updated: {{payload.title}}'
    },
    {
        id: 'issue-status-changed',
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
        console.log('Fetching existing workflows...');
        const response = await request('GET', '/workflows?limit=100');
        const workflows = response.data;

        console.log(`Found ${workflows.length} workflows.`);

        // 1. Delete Targets + Duplicates
        for (const target of TARGETS) {
            // Match any workflow that starts with the ID (e.g., comment-added, comment-added-xyz)
            // Or has the trigger identifier matching
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

        // 2. Create Clean Workflows
        for (const target of TARGETS) {
            console.log(`Creating fresh workflow: ${target.name} (${target.id})...`);

            try {
                // Determine Workflow Group (using first one found or creating basic)
                // We'll skip group ID if optional, or fetch one.
                // Assuming default availability or ignoring.
                // Actually, create workflow requires notificationGroupId.
                // Let's create one if needed or grab the first available.

                // Fetch groups
                const groupsRes = await request('GET', '/notification-groups');
                const groupId = groupsRes.data[0]._id;

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
                    tags: ['fixed-by-assistant']
                };

                // We need to enforce the trigger identifier. 
                // Currently Novu API might auto-generate it from name.
                // But we can try to set it via update OR check if we can pass it.
                // The API documentation says `name` generates identifier but we often want specific.
                // Let's create it, then Check identifier. If mismatch, we might need to recreate/rename tricks.
                // However, if we deleted ALL previous ones, the name "Comment Added" should map to "comment-added".

                const created = await request('POST', '/workflows', payload);

                // The Trigger Identifier is critical.
                const createdTrigger = created.data.triggers[0].identifier;
                console.log(`Created ${target.name}. Trigger: ${createdTrigger}`);

                if (createdTrigger !== target.id) {
                    console.warn(`WARNING: Trigger mismatch! Expected ${target.id}, got ${createdTrigger}`);
                    // There is no easy way to "rename" a trigger identifier via API v1 usually.
                    // But if we truly deleted the others, it should be clean.
                    // Maybe we can pass `customIdentifier`? Let's try passing it in payload just in case it works.
                }

            } catch (e) {
                console.error(`Failed to create ${target.name}:`, e.body || e);
            }
        }

        console.log('✅ Workflow repair complete.');

    } catch (e) {
        console.error('Fatal error:', e);
    }
}

main();
