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
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    console.error("Parse Error:", e, "Body:", body);
                    resolve({});
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        req.end();
    });
}

async function main() {
    try {
        console.log("Fetching environment info...");
        const envRes = await request('/widgets/organization'); // This might not be right endpoint for API Key auth. 
        // Try /environments
        const envs = await request('/environments');
        if (envs.data) {
            const current = envs.data.find(e => e.apiKeys.find(k => k.key === API_KEY));
            if (current) {
                console.log(`Environment: ${current.name} (ID: ${current._id})`);
                console.log(`App Identifier: ${current.identifier}`);
            } else {
                console.log("Could not match API Key to environment.");
                // Just dump the first one or all identifiers
                envs.data.forEach(e => console.log(`Env: ${e.name}, ID: ${e.identifier}`));
            }
        }

        console.log("Fetching workflows...");
        const res = await request('/notification-templates');
        if (res.data) {
            res.data.forEach(wf => {
                console.log(`Workflow: ${wf.name} (ID: ${wf._id})`);
                console.log(`  Trigger: ${wf.triggers[0].identifier}`);
                console.log(`  Steps:`, JSON.stringify(wf.steps, null, 2));
            });
        } else {
            console.log("No workflows found or error:", res);
        }
    } catch (e) {
        console.error(e);
    }
}
main();
