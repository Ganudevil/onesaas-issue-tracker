/**
 * Novu Workflow Setup Script
 * 
 * This script automatically creates all required Novu workflows for the OneSAAS Issue Tracker
 * 
 * Usage:
 *   node scripts/setup-novu-workflows.js YOUR_NOVU_API_KEY
 */

const { Novu } = require('@novu/node');

// Workflow configurations
const workflows = [
    {
        name: 'Issue Created',
        identifier: 'issue-created',
        description: 'Notify users when a new issue is created',
        template: {
            subject: '🆕 New Issue: {{title}}',
            message: 'Priority: {{priority}}\nIssue ID: {{issueId}}',
            cta: {
                action: {
                    status: 'primary',
                    buttons: [
                        {
                            type: 'primary',
                            content: 'View Issue',
                        },
                    ],
                },
            },
        },
    },
    {
        name: 'Comment Added',
        identifier: 'comment-added',
        description: 'Notify users when a comment is added to an issue',
        template: {
            subject: '💬 New comment on "{{issueTitle}}"',
            message: '{{comment}}\n\nIssue ID: {{issueId}}',
            cta: {
                action: {
                    status: 'primary',
                    buttons: [
                        {
                            type: 'primary',
                            content: 'View Issue',
                        },
                    ],
                },
            },
        },
    },
    {
        name: 'Issue Status Changed',
        identifier: 'issue-status-changed',
        description: 'Notify users when issue status changes',
        template: {
            subject: '🔄 Status changed: {{title}}',
            message: 'New status: {{status}}\nIssue ID: {{issueId}}',
            cta: {
                action: {
                    status: 'primary',
                    buttons: [
                        {
                            type: 'primary',
                            content: 'View Issue',
                        },
                    ],
                },
            },
        },
    },
    {
        name: 'Issue Assigned',
        identifier: 'issue-assigned',
        description: 'Notify users when they are assigned to an issue',
        template: {
            subject: '👤 You were assigned: {{title}}',
            message: 'Issue ID: {{issueId}}\nClick to view and start working!',
            cta: {
                action: {
                    status: 'primary',
                    buttons: [
                        {
                            type: 'primary',
                            content: 'View Issue',
                        },
                    ],
                },
            },
        },
    },
];

async function createWorkflow(novu, workflowConfig) {
    try {
        console.log(`\n📝 Creating workflow: ${workflowConfig.name} (${workflowConfig.identifier})`);

        // Create the workflow with in-app notification step
        const workflow = await novu.notificationTemplates.create({
            name: workflowConfig.name,
            notificationGroupId: process.env.NOVU_NOTIFICATION_GROUP_ID || '65d7f03a6a6b2c0013a4b9c1', // Default group
            tags: ['issue-tracker', 'automated'],
            description: workflowConfig.description,
            steps: [
                {
                    template: {
                        type: 'in_app',
                        content: workflowConfig.template.message,
                        subject: workflowConfig.template.subject,
                        cta: workflowConfig.template.cta,
                    },
                    filters: [],
                    active: true,
                },
            ],
            active: true,
            draft: false,
            critical: false,
            preferenceSettings: {
                email: true,
                sms: false,
                in_app: true,
                chat: false,
                push: false,
            },
        });

        // Update the workflow identifier
        await novu.notificationTemplates.update(workflow.data._id, {
            identifier: workflowConfig.identifier,
        });

        console.log(`✅ Successfully created: ${workflowConfig.name}`);
        console.log(`   ID: ${workflow.data._id}`);
        console.log(`   Identifier: ${workflowConfig.identifier}`);

        return workflow.data;
    } catch (error) {
        console.error(`❌ Error creating workflow ${workflowConfig.name}:`, error.message);
        if (error.response?.data) {
            console.error('   Details:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

async function checkExistingWorkflows(novu) {
    try {
        console.log('\n🔍 Checking existing workflows...');
        const { data } = await novu.notificationTemplates.getAll();

        const existingIdentifiers = new Set(
            data.data.map(template => template.triggers[0]?.identifier).filter(Boolean)
        );

        const ourWorkflowIds = workflows.map(w => w.identifier);
        const existing = ourWorkflowIds.filter(id => existingIdentifiers.has(id));

        if (existing.length > 0) {
            console.log(`⚠️  Found ${existing.length} existing workflow(s): ${existing.join(', ')}`);
            console.log('   These will be skipped. Delete them manually if you want to recreate.');
        }

        return existingIdentifiers;
    } catch (error) {
        console.error('⚠️  Could not check existing workflows:', error.message);
        return new Set();
    }
}

async function main() {
    // Get API key from command line argument or environment variable
    const apiKey = process.argv[2] || process.env.NOVU_API_KEY;

    if (!apiKey) {
        console.error('❌ Error: Novu API Key is required!');
        console.error('\nUsage:');
        console.error('  node scripts/setup-novu-workflows.js YOUR_NOVU_API_KEY');
        console.error('\nOr set environment variable:');
        console.error('  NOVU_API_KEY=your_key node scripts/setup-novu-workflows.js');
        process.exit(1);
    }

    console.log('🚀 Novu Workflow Setup Script');
    console.log('================================\n');
    console.log(`📡 Connecting to Novu...`);

    const novu = new Novu(apiKey);

    try {
        // Verify connection by getting notification groups
        await novu.notificationGroups.get();
        console.log('✅ Connected to Novu successfully!\n');
    } catch (error) {
        console.error('❌ Failed to connect to Novu. Please check your API key.');
        console.error('   Error:', error.message);
        process.exit(1);
    }

    // Check for existing workflows
    const existingWorkflows = await checkExistingWorkflows(novu);

    let created = 0;
    let skipped = 0;
    let failed = 0;

    // Create each workflow
    for (const workflowConfig of workflows) {
        if (existingWorkflows.has(workflowConfig.identifier)) {
            console.log(`\n⏭️  Skipping ${workflowConfig.name} (already exists)`);
            skipped++;
            continue;
        }

        try {
            await createWorkflow(novu, workflowConfig);
            created++;
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            failed++;
            console.error(`\n❌ Failed to create ${workflowConfig.name}`);
        }
    }

    // Summary
    console.log('\n================================');
    console.log('📊 Summary:');
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Failed: ${failed}`);
    console.log('================================\n');

    if (created > 0) {
        console.log('✅ Workflow setup complete!\n');
        console.log('Next steps:');
        console.log('1. Add NOVU_API_KEY to your backend .env file');
        console.log('2. Deploy your backend with the environment variable');
        console.log('3. Test notifications by creating issues and comments');
        console.log('\nCheck your Novu dashboard at: https://web.novu.co/workflows\n');
    } else if (skipped === workflows.length) {
        console.log('ℹ️  All workflows already exist. No changes made.\n');
    } else {
        console.log('⚠️  Some workflows failed to create. Check errors above.\n');
    }
}

// Run the script
main().catch(error => {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
});
