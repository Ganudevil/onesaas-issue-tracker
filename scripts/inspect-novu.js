
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    const novu = new Novu(API_KEY);
    console.log('Novu Object Keys:', Object.keys(novu));

    // Check for common resources
    const resources = [
        'notificationTemplates',
        'workflows',
        'integrations',
        'environments',
        'subscribers',
        'topics'
    ];

    resources.forEach(r => {
        console.log(`- ${r}: ${!!novu[r]}`);
        if (novu[r]) {
            console.log(`  Methods: ${Object.keys(novu[r]).join(', ')}`);
        }
    });

}
main();
