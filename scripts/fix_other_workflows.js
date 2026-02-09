
const { Novu } = require('@novu/node');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const novu = new Novu(API_KEY);

const UPDATES = [
    {
        identifier: 'issue-assigned',
        name: 'Issue Assigned',
        content: 'You have been assigned to issue: **{{title}}**',
        variables: [
            { name: 'title', type: 'String', required: true },
            { name: 'issueId', type: 'String', required: true },
            { name: 'url', type: 'String', required: false },
            { name: 'description', type: 'String', required: false }
        ]
    },
    {
        identifier: 'issue-status-changed',
        name: 'Issue Status Changed',
        content: 'Issue **{{title}}** status changed to: {{status}}',
        variables: [
            { name: 'title', type: 'String', required: true },
            { name: 'status', type: 'String', required: true },
            { name: 'issueId', type: 'String', required: true },
            { name: 'url', type: 'String', required: false }
        ]
    },
    {
        identifier: 'issue-updated',
        name: 'Issue Updated',
        content: 'Issue **{{title}}** updated: {{changeType}}',
        variables: [
            { name: 'title', type: 'String', required: true },
            { name: 'changeType', type: 'String', required: true }, // e.g. "Description updated"
            { name: 'issueId', type: 'String', required: true },
            { name: 'url', type: 'String', required: false }
        ]
    }
];

async function fixOtherWorkflows() {
    console.log('--- Fixing Other Workflows ---');

    try {
        const workflows = await novu.notificationTemplates.getAll();

        for (const update of UPDATES) {
            const flow = workflows.data.data.find(w => w.triggers[0].identifier === update.identifier);

            if (!flow) {
                console.log(`❌ Workflow "${update.identifier}" NOT found in Production.`);
                continue;
            }

            console.log(`\nUpdating "${update.identifier}" (${flow._id})...`);

            const response = await novu.notificationTemplates.update(flow._id, {
                name: update.name,
                description: update.name,
                steps: [
                    {
                        template: {
                            type: 'in_app',
                            content: update.content,
                            cta: {
                                data: {
                                    url: '{{url}}'
                                }
                            },
                            variables: update.variables
                        }
                    }
                ],
                triggers: [
                    {
                        identifier: update.identifier,
                        type: 'event',
                        variables: update.variables
                    }
                ]
            });
            console.log(`✅ Updated successfully!`);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
    }
}

fixOtherWorkflows();
