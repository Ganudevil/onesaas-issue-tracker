
const { Novu } = require('@novu/node');

// Development API Key
const DEV_API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';
const novu = new Novu(DEV_API_KEY);

const WORKFLOWS = [
    {
        identifier: 'comment-added',
        name: 'Comment Added',
        content: 'New comment on **{{issueTitle}}**: {{comment}}',
        variables: [
            { name: 'issueTitle', type: 'String', required: true },
            { name: 'comment', type: 'String', required: true },
            { name: 'url', type: 'String', required: false },
            { name: 'issueId', type: 'String', required: true }
        ]
    },
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
        identifier: 'issue-created',
        name: 'Issue Created',
        content: 'New issue created: **{{title}}**',
        variables: [
            { name: 'title', type: 'String', required: true },
            { name: 'issueId', type: 'String', required: true },
            { name: 'url', type: 'String', required: false },
            { name: 'description', type: 'String', required: false }
        ]
    }
];

async function fixDevWorkflows() {
    console.log('--- Fixing Workflows in DEVELOPMENT ---');

    try {
        const workflows = await novu.notificationTemplates.getAll();

        for (const config of WORKFLOWS) {
            let flow = workflows.data.data.find(w => w.triggers[0].identifier === config.identifier);

            if (!flow) {
                console.log(`⚠️ Workflow "${config.identifier}" not found in Dev. Creating it...`);

                // Need group ID
                const groups = await novu.notificationGroups.get();
                const groupId = groups.data.data[0]._id;

                flow = await novu.notificationTemplates.create({
                    name: config.name,
                    notificationGroupId: groupId,
                    steps: [{
                        template: {
                            type: 'in_app',
                            content: config.content,
                            cta: { data: { url: '{{url}}' } },
                            variables: config.variables
                        },
                        active: true
                    }],
                    triggers: [{ identifier: config.identifier, type: 'event', variables: config.variables }],
                    active: true
                });
                console.log(`✅ Created "${config.identifier}" in Dev.`);
            } else {
                console.log(`🔧 Updating "${config.identifier}" (${flow._id}) in Dev...`);
                await novu.notificationTemplates.update(flow._id, {
                    name: config.name,
                    description: config.name,
                    active: true,
                    steps: [
                        {
                            template: {
                                type: 'in_app',
                                content: config.content,
                                cta: {
                                    data: {
                                        url: '{{url}}'
                                    }
                                },
                                variables: config.variables
                            },
                            active: true
                        }
                    ],
                    triggers: [
                        {
                            identifier: config.identifier,
                            type: 'event',
                            variables: config.variables
                        }
                    ]
                });
                console.log(`✅ Updated "${config.identifier}" in Dev.`);
            }
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
    }
}

fixDevWorkflows();
