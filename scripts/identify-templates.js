
const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function main() {
    console.log('🔍 Identifying Templates...');

    const entityIds = [
        '69830b4ae764226c563d9d6b',
        '69830b49d46c4dce97414266',
        '69830b48e9e877682b6f9e77',
        '69830b47e764226c563d9b93',
        '698304f5b4e9eec31e118c50',
        '698304f5e2861b689dada66e',
        '698304f4807f8ec09550f91d',
        '698304f47cb278f3d2848532',
        '6983038793bdb65fcbe9e494',
        '698303863283e1d48a449fb3'
    ];

    for (const eid of entityIds) {
        try {
            const res = await axios.get(`https://api.novu.co/v1/notification-templates/${eid}`, {
                headers: { 'Authorization': `ApiKey ${API_KEY}` }
            });
            const t = res.data.data;
            console.log(`- EntityID: ${eid} -> Name: "${t.name}" | Trigger: "${t.triggers[0].identifier}"`);
        } catch (err) {
            console.error(`- EntityID: ${eid} -> ❌ Failed: ${err.message}`);
        }
    }
}
main();
