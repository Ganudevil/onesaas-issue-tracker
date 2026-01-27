const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:54322/postgres',
    connectionTimeoutMillis: 5000,
});

async function run() {
    console.log('Connecting...');
    try {
        await client.connect();
        console.log('Connected!');
        const res = await client.query('SELECT NOW()');
        console.log('Query result:', res.rows[0]);
        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
}

run();
