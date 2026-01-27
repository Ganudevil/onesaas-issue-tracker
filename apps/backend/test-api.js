const axios = require('axios');

async function test() {
    try {
        // 1. Get Token
        console.log('Getting Token...');
        const tokenRes = await axios.post('http://localhost:8080/realms/onesaas/protocol/openid-connect/token', new URLSearchParams({
            username: 'testuser',
            password: 'password',
            grant_type: 'password',
            client_id: 'issue-tracker'
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const token = tokenRes.data.access_token;
        console.log('Got Token length:', token.length);

        // 2. Call API to get user
        console.log('Getting User...');
        const userRes = await axios.get('http://localhost:3001/users/by-email?email=test%40example.com', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-tenant-id': 'tenant1'
            }
        });
        console.log('User:', userRes.data);

        // 3. Update Role
        console.log('Updating Role to admin...');
        const updateRes = await axios.patch('http://localhost:3001/users/test%40example.com/role', {
            role: 'admin'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-tenant-id': 'tenant1'
            }
        });
        console.log('Role Update Result:', updateRes.data);

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

test();
