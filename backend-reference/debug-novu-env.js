const https = require('https');
require('dotenv').config();

const API_KEY = process.env.NOVU_API_KEY;
const API_URL = 'https://api.novu.co/v1';

function request(path) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `ApiKey ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        };
        const req = https.request(`${API_URL}${path}`, options, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    try {
        const envs = await request('/environments');
        if (envs.data) {
            const current = envs.data.find(e => e.apiKeys.find(k => k.key === API_KEY));
            if (current) {
                console.log(`App Identifier: ${current.identifier}`);
            } else {
                console.log("Could not find matching env.");
                // Dump all
                envs.data.forEach(e => console.log(`Env: ${e.name} has ID: ${e.identifier}`));
            }
        } else {
            console.log("Error fetching envs:", envs);
        }
    } catch (e) {
        console.error(e);
    }
}
main();
