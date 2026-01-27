const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '54322'),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'postgres',
});

async function checkTenant2() {
    try {
        // Check if tenant2 schema exists
        const schemaCheck = await pool.query(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name = 'tenant2'
        `);

        console.log('Schema tenant2 exists:', schemaCheck.rows.length > 0);

        if (schemaCheck.rows.length === 0) {
            console.log('❌ tenant2 schema does not exist!');
            return;
        }

        // Check tables in tenant2
        const tablesCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'tenant2'
        `);

        console.log('\nTables in tenant2:', tablesCheck.rows.map(r => r.table_name));

        // Check users in tenant2
        const usersCheck = await pool.query(`
            SELECT id, email, display_name, role 
            FROM tenant2.users 
            WHERE deleted_at IS NULL
        `);

        console.log('\nUsers in tenant2:');
        usersCheck.rows.forEach(u => {
            console.log(`  - ${u.email} (${u.display_name}) - Role: ${u.role}`);
        });

        // Check issues in tenant2
        const issuesCheck = await pool.query(`
            SELECT COUNT(*) as count
            FROM tenant2.issues
            WHERE deleted_at IS NULL
        `);

        console.log(`\nIssues in tenant2: ${issuesCheck.rows[0].count}`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkTenant2();
