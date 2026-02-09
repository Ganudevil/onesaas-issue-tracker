
const { Novu } = require('@novu/node');

// Production API Key
const API_KEY = '0e6ea8224d1faabe42f379cff81a2fc5';
const novu = new Novu(API_KEY);

const WORKFLOW_ID = '69832cd03b2cc7778d500639'; // FROM DEBUG OUTPUT

async function fixWorkflow() {
    console.log(`Updating workflow: ${WORKFLOW_ID}...`);

    try {
        const response = await novu.notificationTemplates.update(WORKFLOW_ID, {
            name: 'Comment Added',
            description: 'Notification when a comment is added to an issue',
            steps: [
                {
                    template: {
                        type: 'in_app',
                        content: 'New comment on **{{issueTitle}}**: {{comment}}',
                        cta: {
                            data: {
                                url: '{{url}}'
                            }
                        },
                        variables: [
                            { name: 'issueTitle', type: 'String', required: true },
                            { name: 'comment', type: 'String', required: true },
                            { name: 'url', type: 'String', required: false },
                            { name: 'issueId', type: 'String', required: true }
                        ]
                    }
                }
            ],
            triggers: [
                {
                    identifier: 'comment-added',
                    type: 'event',
                    variables: [
                        { name: 'issueTitle', type: 'String' },
                        { name: 'comment', type: 'String' },
                        { name: 'url', type: 'String' },
                        { name: 'issueId', type: 'String' }
                    ]
                }
            ]
        });

        console.log('✅ Workflow updated successfully!');
        console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (err) {
        console.error('❌ Failed to update workflow:', err.message);
        if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
    }
}

fixWorkflow();
