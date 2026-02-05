
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('📝 Configuring Workflow Content...');
    const novu = new Novu(API_KEY);

    // Definitions mapping ID to Content
    const configs = {
        'issue-created': {
            subject: 'New Issue: {{title}}',
            body: 'A new issue has been created.<br>Priority: {{priority}}<br><a href="{{url}}">View Issue</a>'
        },
        'issue-assigned': {
            subject: 'You have been assigned: {{title}}',
            body: 'You have been assigned to issue #{{issueId}}: {{title}}'
        },
        'comment-added': {
            subject: 'New Comment on {{issueTitle}}',
            body: 'Comment: {{comment}}<br><a href="{{url}}">View Issue</a>'
        },
        'issue-status-changed': {
            subject: 'Status Updated: {{title}}',
            body: 'The status of issue #{{issueId}} has been changed to {{status}}.'
        }
    };

    // Get all workflows
    const result = await novu.notificationTemplates.getAll(0, 100);
    const workflows = result.data.data;

    for (const t of workflows) {
        const id = t.triggers[0].identifier;
        if (!configs[id]) continue;

        console.log(`Configuring "${t.name}" (${id})...`);
        const conf = configs[id];

        try {
            // We need to Update the Workflow Steps.
            // This is complex via API (updating steps requires providing the whole step tree).
            // We will simplify: Update the first step if it exists, or create new structure.

            // Note: Simplest way is a clean update of the steps structure.
            // One In-App step (for dashboard bell) + One Email step.

            await novu.notificationTemplates.update(t._id, {
                steps: [
                    {
                        template: {
                            type: 'in_app',
                            content: conf.subject // In-App usually just shows the "Subject" equivalent
                        },
                        active: true
                    },
                    {
                        template: {
                            type: 'email',
                            subject: conf.subject,
                            content: [{ type: 'text', content: conf.body }],
                            layoutId: null // Use default
                        },
                        active: true
                    }
                ]
            });
            console.log('   ✅ Updated Steps (In-App + Email)');

        } catch (e) {
            console.error('   ❌ Failed to update:', e.message);
            if (e.response?.data) console.error(JSON.stringify(e.response.data));
        }
    }
}
main();
