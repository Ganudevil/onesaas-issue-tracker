const axios = require('axios');
const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

async function getAppId() {
    try {
        // Fetch organization or integration details
        // The /v1/integrations endpoint might contain identifier info, or /v1/organizations/me
        const response = await axios.get('https://api.novu.co/v1/subscribers', { // Try subscribers list or something generic to check auth
            headers: {
                'Authorization': `ApiKey ${API_KEY}`
            }
        });

        // Actually, to get simple App Identifier, often it's in the Dashboard URL or Settings.
        // Via API, there isn't a direct "get my app id" endpoint documented commonly in simple docs,
        // BUT we can try /v1/environments/me (if it exists) or check headers.

        // Let's try fetching `/v1/changes` or just check if we can verify the key works.
        // A better bet is checking `/v1/environments`

        const envResponse = await axios.get('https://api.novu.co/v1/environments', {
            headers: {
                'Authorization': `ApiKey ${API_KEY}`
            }
        });

        console.log('Environments:');
        envResponse.data.data.forEach(env => {
            console.log(`- Name: ${env.name}, Identifier (App ID): ${env.identifier}, API Key: ${env.apiKeys[0]?.key}`);
        });

    } catch (error) {
        console.error('Error fetching details:', error.message);
        if (error.response) console.error(JSON.stringify(error.response.data));
    }
}

getAppId();
