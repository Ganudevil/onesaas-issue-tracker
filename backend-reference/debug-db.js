
const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:54322/postgres',
});

async function run() {
    await client.connect();
    console.log('Connected to DB...');

    const badUserId = '5e4448cd-704a-4832-a9f9-8d151bb028c2';
    const email = 'yesu@gmail.com';

    console.log(`--- Cleaning up data for ${email} (${badUserId}) ---`);

    // 1. Delete comments by this user
    console.log('Deleting comments...');
    await client.query(`DELETE FROM tenant1.comments WHERE created_by = '${badUserId}'`);

    // 2. Delete issues created by this user OR assigned to this user
    console.log('Deleting issues...');
    await client.query(`DELETE FROM tenant1.issues WHERE created_by = '${badUserId}' OR assigned_to = '${badUserId}'`);

    // 3. Delete the user
    console.log('Deleting user...');
    await client.query(`DELETE FROM tenant1.users WHERE id = '${badUserId}'`);

    console.log('--- Done ---');
    await client.end();
}

run().catch(e => console.error(e));
