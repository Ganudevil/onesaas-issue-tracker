/**
 * Novu Workflow Setup Script
 * 
 * This script automatically creates all required Novu workflows for the OneSAAS Issue Tracker
 * 
 * Usage:
 *   node scripts/setup-novu-workflows.js YOUR_NOVU_API_KEY
 */

const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));

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

async function createWorkflow(novu, workflowConfig, notificationGroupId) {
    try {
        // Create the workflow with in-app notification step
        const response = await novu.notificationTemplates.create({
            name: workflowConfig.name,
            notificationGroupId: notificationGroupId,
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

        const workflowId = response.data?.data?._id || response.data?._id;

        if (!workflowId) {
            console.error('❌ Could not find ID in create response:', JSON.stringify(response.data, null, 2));
            throw new Error('Workflow creation returned no ID');
        }

        // Update the workflow identifier
        // Note: Some API versions let you set identifier in create, but update is safer
        await novu.notificationTemplates.update(workflowId, {
            identifier: workflowConfig.identifier,
        });

        console.log(`✅ Successfully created: ${workflowConfig.name}`);
        console.log(`   ID: ${workflowId}`);
        console.log(`   Identifier: ${workflowConfig.identifier}`);

        return response.data;
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

    let notificationGroupId;

    try {
        // Verify connection by getting notification groups
        const groupsResponse = await novu.notificationGroups.get();
        const groups = groupsResponse.data.data;
        if (groups && groups.length > 0) {
            notificationGroupId = groups[0]._id;
            console.log(`✅ Connected to Novu! Using Notification Group: ${groups[0].name} (${notificationGroupId})\n`);
        } else {
            throw new Error('No notification groups found');
        }
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
            await createWorkflow(novu, workflowConfig, notificationGroupId);
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
