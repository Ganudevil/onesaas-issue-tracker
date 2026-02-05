
const path = require('path');
const { Novu } = require(path.join(__dirname, '../apps/backend/node_modules/@novu/node'));
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🔍 Detailed Probe Start...');
    const novu = new Novu(API_KEY);

    try {
        console.log('1. Attempting getAll() with NO parameters...');
        const res1 = await novu.notificationTemplates.getAll();
        console.log('Result length:', res1.data.data.length);

        if (res1.data.data.length > 0) {
            console.log('Workflows found:');
            res1.data.data.forEach(w => {
                console.log(`- Name: ${w.name}, TriggerID: ${w.triggers[0].identifier}, CreatedAt: ${w.createdAt}`);
            });
        } else {
            console.log('No workflows found with getAll()');

            console.log('2. checking notification groups to see if that helps list anything...');
            const groups = await novu.notificationGroups.get();
            console.log('Groups found:', groups.data.data.length);
            groups.data.data.forEach(g => {
                console.log(`- Group: ${g.name}, ID: ${g._id}`);
            });
        }

    } catch (err) {
        console.error('❌ Detailed Probe Failed:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data));
        }
    }
}
main();
