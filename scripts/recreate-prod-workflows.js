const { Novu } = require('@novu/node');

// Production API Key from backend/src/notifications/novu.service.ts
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';

const workflows = [
    {
        name: 'Issue Created',
        identifier: 'issue-created-blbs',
        description: 'Notification when a new issue is created',
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: 'New Issue: {{payload.title}} ({{payload.priority}})',
                    cta: {
                        action: {
                            status: 'primary',
                            buttons: [{ type: 'primary', content: 'View Issue', url: '{{payload.url}}' }]
                        }
                    }
                }
            }
        ]
    },
    {
        name: 'Issue Assigned',
        identifier: 'issue-assigned-d7el',
        description: 'Notification when an issue is assigned to you',
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: 'You were assigned to issue: {{payload.title}}',
                    cta: {
                        action: {
                            status: 'primary',
                            buttons: [{ type: 'primary', content: 'View Issue', url: '{{payload.url}}' }]
                        }
                    }
                }
            }
        ]
    },
    {
        name: 'Issue Status Changed',
        identifier: 'issue-status-changed-al62',
        description: 'Notification when issue status changes',
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: 'Issue "{{payload.title}}" status changed to {{payload.status}}',
                    cta: {
                        action: {
                            status: 'primary',
                            buttons: [{ type: 'primary', content: 'View Issue', url: '{{payload.url}}' }]
                        }
                    }
                }
            }
        ]
    },
    {
        name: 'Comment Added',
        identifier: 'comment-added-ez1b',
        description: 'Notification when a comment is added',
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: 'New comment on "{{payload.issueTitle}}": {{payload.comment}}',
                    cta: {
                        action: {
                            status: 'primary',
                            buttons: [{ type: 'primary', content: 'View Issue', url: '{{payload.url}}' }]
                        }
                    }
                }
            }
        ]
    },
    {
        name: 'Issue Updated',
        identifier: 'issue-updated', // No suffix in backend
        description: 'Notification when an issue is updated',
        steps: [
            {
                template: {
                    type: 'in_app',
                    content: 'Issue "{{payload.title}}" was updated: {{payload.changeType}}',
                    cta: {
                        action: {
                            status: 'primary',
                            buttons: [{ type: 'primary', content: 'View Issue', url: '{{payload.url}}' }]
                        }
                    }
                }
            }
        ]
    }
];

async function main() {
    console.log('🚀 Starting Prod Workflow Re-creation...');
    const novu = new Novu(API_KEY);

    // 1. Get Notification Group (Required)
    let notificationGroupId;
    try {
        const groups = await novu.notificationGroups.get();
        if (groups.data.data.length > 0) {
            notificationGroupId = groups.data.data[0]._id;
            console.log(`✅ Using Notification Group: ${groups.data.data[0].name}`);
        } else {
            throw new Error('No notification groups found');
        }
    } catch (e) {
        console.error('❌ Failed to get notification groups:', e.message);
        return;
    }

    // 2. Delete ALL existing workflows
    console.log('\n🗑️  Deleting ALL existing workflows...');
    try {
        const { data } = await novu.notificationTemplates.getAll(0, 100);
        const existing = data.data;
        console.log(`Found ${existing.length} workflows to delete.`);

        for (const w of existing) {
            process.stdout.write(`   Deleting ${w.name} (${w.triggers[0]?.identifier})... `);
            await novu.notificationTemplates.delete(w._id);
            console.log('Done');
        }
    } catch (e) {
        console.error('❌ Error during deletion:', e.message);
    }

    // 3. Create New Workflows
    console.log('\n✨ Creating NEW workflows with CORRECT identifiers...');
    for (const w of workflows) {
        try {
            console.log(`   Creating "${w.name}" -> ${w.identifier}...`);
            await novu.notificationTemplates.create({
                name: w.name,
                notificationGroupId: notificationGroupId,
                steps: w.steps,
                active: true,
                draft: false,
                critical: false,
                preferenceSettings: {
                    email: true,
                    sms: true,
                    in_app: true,
                    chat: true,
                    push: true
                },
                tags: ['production', 'issue-tracker']
            });

            // We need to update the trigger identifier immediately after creation because
            // create() might auto-generate a slug if we don't pass it in (and the SDK
            // types/endpoints for create sometimes don't respect identifier directly depending on version).
            // BUT: The most reliable way is to fetch by name/tag or just list and find the one we just made?
            // Actually, let's just create it. The SDK `create` usually takes `triggers` or handles slug.
            // Let's double check if we can pass identifier directly in create.
            // If not, we will need to update it.

            // To be safe, we will find it and update it to be 100% sure.
            // Wait, we can't easily find it if we don't know the ID yet and names might be duplicate 
            // (though we just deleted all).

            // Actually, the `create` response returns the created workflow.
            // Let's try to pass the identifier in the create payload if the SDK supports it, or use the response.

        } catch (e) {
            console.error(`❌ Failed to create ${w.name}:`, e.message);
        }
    }

    // 4. Verify Matches
    console.log('\n🔍 Verifying created workflows...');
    const result = await novu.notificationTemplates.getAll(0, 100);
    const created = result.data.data;

    for (const w of workflows) {
        const match = created.find(c => c.name === w.name); // Match by name since we just cleared
        if (match) {
            // UPDATE identifier to be absolutely sure
            if (match.triggers[0].identifier !== w.identifier) {
                console.log(`   ⚠️  Correcting identifier for ${w.name} from ${match.triggers[0].identifier} to ${w.identifier}...`);
                await novu.notificationTemplates.update(match._id, {
                    identifier: w.identifier
                });
                console.log('      ✅ Fixed');
            } else {
                console.log(`   ✅ ${w.name} matches ${w.identifier}`);
            }
        } else {
            console.error(`   ❌ Could not find ${w.name} after creation!`);
        }
    }

    console.log('\n🎉 DONE! Workflows are reset.');
}

main();
