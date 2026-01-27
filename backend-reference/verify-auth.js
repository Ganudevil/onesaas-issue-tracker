const axios = require('axios');

async function test() {
    try {
        console.log('1. Getting Token...');
        const tokenRes = await axios.post('http://127.0.0.1:8080/realms/onesaas/protocol/openid-connect/token', new URLSearchParams({
            client_id: 'issue-tracker',
            username: 'testuser',
            password: 'password',
            grant_type: 'password'
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const token = tokenRes.data.access_token;
        console.log('✅ Got Token');

        // Test Issues (Should work)
        console.log('2. Creating Issue...');
        try {
            const issueRes = await axios.post('http://127.0.0.1:3001/issues', {
                title: 'Test Issue ' + Date.now(),
                description: 'Test Description',
                priority: 'medium'
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-tenant-id': 'tenant1'
                }
            });
            console.log('✅ Issue Created. Status:', issueRes.status);
        } catch (e) {
            console.error('❌ Issue Creation Failed:', e.response ? e.response.status : e.message);
            if (e.response) console.error('Data:', e.response.data);
        }

        // Test Users (The failing one)
        console.log('3. Getting User by Email...');
        try {
            const userRes = await axios.get('http://127.0.0.1:3001/users/by-email?email=test@example.com', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-tenant-id': 'tenant1'
                }
            });
            console.log('✅ Get User Success. Status:', userRes.status);
            console.log('User:', userRes.data);
        } catch (e) {
            console.error('❌ Get User Failed:', e.response ? e.response.status : e.message);
            if (e.response) console.error('Data:', e.response.data);
        }

    } catch (e) {
        console.error('❌ Fatal Error:', e.message);
        if (e.response) console.error('Data:', e.response.data);
    }
}

test();
