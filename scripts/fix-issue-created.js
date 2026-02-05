
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));

const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🔧 Fixing "Issue Created" Workflow...');
    const novu = new Novu(API_KEY);

    // 1. Get the specific workflow
    let template;
    try {
        const result = await novu.notificationTemplates.getAll();
        template = result.data.data.find(t => t.triggers[0]?.identifier === 'issue-created');

        if (!template) {
            console.error('❌ Could not find "issue-created" workflow!');
            process.exit(1);
        }
        console.log(`✅ Found workflow: ${template.name} (${template._id})`);
    } catch (e) {
        console.error('Failed to fetch:', e.message);
        process.exit(1);
    }

    // 2. Check steps
    console.log('Current steps:', JSON.stringify(template.steps, null, 2));

    // 3. Force Update with a clean step structure
    // We explicitly set the providerId to 'novu-in-app' if possible, or just standard in-app type
    const newSteps = [{
        template: {
            type: 'in_app',
            content: 'Priority: {{priority}}\nIssue ID: {{issueId}}',
            subject: '🆕 New Issue: {{title}}',
            cta: {
                action: {
                    status: 'primary',
                    buttons: []
                }
            }
        },
        active: true,
        filters: []
    }];

    try {
        console.log('🔄 Updating workflow steps...');
        const updateRes = await novu.notificationTemplates.update(template._id, {
            steps: newSteps,
            active: true
        });
        console.log('✅ Update response:', updateRes.data.data ? 'Success' : updateRes.data);

        // 4. Also check Integration status
        console.log('\n🔍 Checking Integrations...');
        const integrations = await novu.integrations.getAll();
        const inApp = integrations.data.data.find(i => i.channel === 'in_app');

        if (!inApp) {
            console.log('⚠️  No active In-App integration found! Creating one...');
            const groups = await novu.notificationGroups.get(); // Need _id? Not for integration
            // ProviderId for In-App is 'novu' usually
            await novu.integrations.create({
                providerId: 'novu',
                channel: 'in_app',
                active: true,
                check: true
            });
            console.log('✅ In-App integration created.');
        } else if (!inApp.active) {
            console.log('⚠️  In-App integration is INACTIVE. Activating...');
            // Novu node SDK update integration might differ, let's try
            // await novu.integrations.update(...) - SDK support varies
            console.log('   Please check Integrations page to enable it manually if script fails here.');
        } else {
            console.log('✅ In-App integration is ACTIVE.');
        }

    } catch (err) {
        console.error('❌ Failed to update:', err.message);
        if (err.response?.data) console.error(JSON.stringify(err.response.data));
    }

    console.log('\n✅ Done. Please check dashboard.');
}

main();
