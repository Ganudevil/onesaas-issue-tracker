
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    const novu = new Novu(API_KEY);
    const result = await novu.notificationTemplates.getAll();
    console.log('--- Current Workflows ---');
    result.data.data.forEach(t => {
        console.log(`Name: "${t.name}" | ID: "${t.triggers[0]?.identifier}" | _id: ${t._id}`);
    });
}
main();
