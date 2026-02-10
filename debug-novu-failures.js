const https = require('https');

const API_KEY = '84ec40b73ccba3e7205185bff4e00ffe';

function request(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.novu.co',
            path: '/v1' + path,
            method: 'GET',
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
        console.log('Fetching recent activity feed...');
        const response = await request('/notifications?limit=20');
        const activities = response.data;

        console.log('--- Recent Failures ---');
        let foundFailure = false;

        for (const activity of activities) {
            // Check if transaction status is failed (or has error)
            // Note: Activity object structure might vary, logging key parts
            if (activity.status === 'failed' || (activity.jobs && activity.jobs.some(j => j.status === 'failed'))) {
                foundFailure = true;
                console.log(`Transaction ID: ${activity.transactionId}`);
                console.log(`Workflow: ${activity.template.name} (Trigger: ${activity.template.triggers[0].identifier})`);
                console.log(`Subscriber: ${activity.subscriber?.firstName} (${activity.subscriber?.sysId})`);
                console.log(`Status: ${activity.status}`);

                if (activity.jobs) {
                    activity.jobs.forEach(job => {
                        console.log(`  - Job: ${job.type} -> ${job.status}`);
                        if (job.payload) console.log(`    Payload: ${JSON.stringify(job.payload).substring(0, 100)}...`);
                        if (job.errorMessage || job.error) {
                            console.log(`    ERROR: ${job.errorMessage || JSON.stringify(job.error)}`);
                        }
                        // Sometimes details are deeply nested
                        if (job.executionDetails) {
                            job.executionDetails.forEach(d => {
                                console.log(`    Detail: ${d.detail} (${d.source})`);
                            });
                        }
                    });
                }
                console.log('---');
            }
        }

        if (!foundFailure) {
            console.log('No recent failures found in the last 20 notifications.');
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

main();
