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

async function fixTenant2Permissions() {
    try {
        console.log('Updating harsh@gmail.com to admin role in tenant2...');

        const result = await pool.query(`
            UPDATE tenant2.users
            SET role = 'admin'
            WHERE email = 'harsh@gmail.com'
            RETURNING id, email, display_name, role
        `);

        if (result.rows.length > 0) {
            console.log('✅ Updated successfully:');
            result.rows.forEach(u => {
                console.log(`  - ${u.email} (${u.display_name}) - Role: ${u.role}`);
            });
        } else {
            console.log('❌ User not found');
        }

        // Verify all users
        const allUsers = await pool.query(`
            SELECT email, display_name, role
            FROM tenant2.users
            WHERE deleted_at IS NULL
            ORDER BY role DESC
        `);

        console.log('\n📋 All users in tenant2:');
        allUsers.rows.forEach(u => {
            console.log(`  - ${u.email} (${u.display_name || 'N/A'}) - Role: ${u.role}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

fixTenant2Permissions();
