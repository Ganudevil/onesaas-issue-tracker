
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));

// Hardcoded key from user's environment in Vercel/Mock
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

const workflows = [
    {
        name: 'Issue Created',
        identifier: 'issue-created-5q2w',
        description: 'Notify users when a new issue is created',
        template: {
            subject: 'New Issue Created',
            message: 'New Issue: {{title}}\nPriority: {{priority}}',
        },
    },
    {
        name: 'Comment Added',
        identifier: 'comment-added-44gh',
        description: 'Notify users when a comment is added to an issue',
        template: {
            subject: 'New Comment',
            message: 'Comment on {{issueTitle}}: "{{comment}}"',
        },
    },
    {
        name: 'Issue Status Changed',
        identifier: 'issue-status-changed-i6e1',
        description: 'Notify users when issue status changes',
        template: {
            subject: 'Status Changed',
            message: 'Issue: {{title}}\nNew Status: {{status}}',
        },
    },
    {
        name: 'Issue Assigned',
        identifier: 'issue-assigned-rqdp',
        description: 'Notify users when they are assigned to an issue',
        template: {
            subject: 'Issue Assigned',
            message: 'You have been assigned to: {{title}}',
        },
    },
];

async function main() {
    console.log('🚀 Repairing Novu Workflows...');
    const novu = new Novu(API_KEY);

    // Get all existing templates
    let templates;
    try {
        const result = await novu.notificationTemplates.getAll();
        templates = result.data.data;
        console.log(`Create connection successful. Found ${templates.length} existing workflows.`);
    } catch (e) {
        console.error('Failed to connect or fetch workflows:', e.message);
        process.exit(1);
    }

    // Get Notification Group
    const groupsResponse = await novu.notificationGroups.get();
    const notificationGroupId = groupsResponse.data.data[0]._id;

    for (const config of workflows) {
        const existing = templates.find(t => t.triggers[0]?.identifier === config.identifier);

        if (existing) {
            console.log(`\n🔄 Updating existing workflow: ${config.name} (${config.identifier})...`);

            // Re-create the steps structure
            const steps = [
                {
                    template: {
                        type: 'in_app',
                        content: config.template.message,
                        subject: config.template.subject,
                        cta: { action: { buttons: [] } } // Simple CTA
                    },
                    active: true,
                    filters: []
                },
                {
                    template: {
                        type: 'email',
                        subject: config.template.subject,
                        content: [{ type: 'text', content: config.template.message.replace(/\n/g, '<br>') }], // basic text content
                        layoutId: null
                    },
                    active: true,
                    filters: []
                }
            ];

            try {
                await novu.notificationTemplates.update(existing._id, {
                    name: config.name,
                    description: config.description,
                    steps: steps,
                    // Ensure it is active
                    active: true,
                    // Ensure trigger is correct
                    triggers: [{ identifier: config.identifier, type: 'event' }]
                });
                console.log(`✅ Update successful!`);
            } catch (err) {
                console.error(`❌ Failed to update ${config.name}:`, err.message);
                if (err.response?.data) console.error(JSON.stringify(err.response.data));
            }

        } else {
            console.log(`\n✨ Creating new workflow: ${config.name}...`);
            try {
                await novu.notificationTemplates.create({
                    name: config.name,
                    notificationGroupId: notificationGroupId,
                    description: config.description,
                    steps: [
                        {
                            template: {
                                type: 'in_app',
                                content: config.template.message,
                                subject: config.template.subject,
                            },
                            active: true,
                        },
                        {
                            template: {
                                type: 'email',
                                subject: config.template.subject,
                                content: [{ type: 'text', content: config.template.message.replace(/\n/g, '<br>') }],
                            },
                            active: true,
                        },
                    ],
                    active: true,
                    triggers: [{ identifier: config.identifier, type: 'event' }]
                });
                console.log(`✅ Creation successful!`);
            } catch (err) {
                console.error(`❌ Failed to create ${config.name}:`, err.message);
                if (err.response?.data) console.error(JSON.stringify(err.response.data));
            }
        }
    }

    console.log('\n✅ Repair Complete. Please check your Dashboard.');
}

main();
