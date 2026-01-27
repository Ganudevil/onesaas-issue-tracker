const http = require('http');

const url = 'http://127.0.0.1:8080/realms/onesaas/protocol/openid-connect/certs';

console.log(`Testing connection to: ${url}`);

http.get(url, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response Body Preview:', data.substring(0, 200));
        console.log('Connection Successful!');
    });

}).on('error', (err) => {
    console.error('Connection Failed:', err.message);
});
