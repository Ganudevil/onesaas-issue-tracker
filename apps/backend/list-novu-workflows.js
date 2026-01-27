const https = require('https');
require('dotenv').config();

const API_KEY = process.env.NOVU_API_KEY;
const API_URL = 'https://api.novu.co/v1';

function request(method, path) {
    return new Promise((resolve, reject) => {
        const options = {
            method: method,
            headers: {
                'Authorization': `ApiKey ${API_KEY}`
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
        console.log("Fetching workflows...");
        const res = await request('GET', '/notification-templates?page=0&limit=100');
        if (res.data) {
            console.log(`Found ${res.data.length} workflows:`);
            res.data.forEach(wf => {
                console.log(`- Name: "${wf.name}" | Trigger: "${wf.triggers[0].identifier}" | ID: ${wf._id}`);
            });
        }
    } catch (e) {
        console.error(e);
    }
}
main();
