/**
 * Script to automatically create Novu workflows in Production
 * Run with: node scripts/create-novu-workflows.js
 */

const { Novu } = require('@novu/node');

// Your Production API Key
const NOVU_API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';

const novu = new Novu(NOVU_API_KEY);

const workflows = [
    {
        name: 'Issue Created',
        identifier: 'issue-created',
        description: 'Notification when a new issue is created',
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: 'New issue created: {{payload.title}}',
                }
            }
        ]
    },
    {
        name: 'Issue Assigned',
        identifier: 'issue-assigned',
        description: 'Notification when an issue is assigned',
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: 'You were assigned to: {{payload.title}}',
                }
            }
        ]
    },
    {
        name: 'Issue Status Changed',
        identifier: 'issue-status-changed',
        description: 'Notification when issue status changes',
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: 'Issue "{{payload.title}}" status changed to {{payload.status}}',
                }
            }
        ]
    },
    {
        name: 'Comment Added',
        identifier: 'comment-added',
        description: 'Notification when a comment is added',
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: 'New comment on "{{payload.issueTitle}}": {{payload.comment}}',
                }
            }
        ]
    },
    {
        name: 'Issue Updated',
        identifier: 'issue-updated',
        description: 'Notification when an issue is updated',
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: 'Issue "{{payload.title}}" was updated: {{payload.changeType}}',
                }
            }
        ]
    }
];

async function createWorkflows() {
    console.log('🚀 Creating Novu workflows...\n');

    for (const workflow of workflows) {
        try {
            console.log(`Creating workflow: ${workflow.name} (${workflow.identifier})...`);

            const result = await novu.notificationTemplates.create({
                name: workflow.name,
                notificationGroupId: process.env.NOVU_NOTIFICATION_GROUP_ID || 'general',
                tags: ['production', 'issue-tracker'],
                description: workflow.description,
                steps: workflow.steps.map(step => ({
                    template: {
                        type: step.template.type,
                        content: step.template.content,
                    },
                    active: true
                })),
                active: true,
                draft: false,
                critical: false,
                preferenceSettings: {
                    email: true,
                    sms: false,
                    in_app: true,
                    chat: false,
                    push: false
                }
            });

            console.log(`✅ Created: ${workflow.name}`);
            console.log(`   ID: ${result.data._id}`);
            console.log(`   Trigger: ${workflow.identifier}\n`);

        } catch (error) {
            if (error.message?.includes('already exists')) {
                console.log(`⚠️  Workflow "${workflow.name}" already exists, skipping...\n`);
            } else {
                console.error(`❌ Error creating ${workflow.name}:`, error.message);
                console.error(error);
            }
        }
    }

    console.log('\n✨ Done! All workflows created successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to Novu dashboard and verify workflows are visible');
    console.log('2. Redeploy your frontend on Vercel');
    console.log('3. Create an issue to test notifications');
}

createWorkflows().catch(console.error);
