const https = require('https');

const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';
const BASE_URL = 'https://api.novu.co/v1';

function request(method, path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.novu.co',
            path: '/v1' + path,
            method: method,
            headers: {
                'Authorization': `ApiKey ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function main() {
    try {
        console.log('Fetching workflows from Production...');
        const response = await request('GET', '/workflows?limit=100');
        const workflows = response.data;

        console.log('--- Current Production Workflows ---');
        workflows.forEach(w => {
            console.log(`Name: ${w.name}`);
            console.log(`ID: ${w._id}`);
            console.log(`Trigger Identifier: ${w.triggers[0]?.identifier}`);
            console.log('---');
        });

    } catch (e) {
        console.error('Error:', e);
    }
}

main();
