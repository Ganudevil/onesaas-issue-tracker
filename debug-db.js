
const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:54322/postgres',
});

async function run() {
    await client.connect();
    const res = await client.query('SELECT * FROM users');
    console.log(res.rows);
    await client.end();
}

run().catch(e => console.error(e));
