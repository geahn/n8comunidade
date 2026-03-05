const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: false
});

async function testConnection() {
    console.log('Testing connection to:', process.env.DB_HOST);
    try {
        const client = await pool.connect();
        console.log('✅ Successfully connected to the database!');

        const res = await client.query('SELECT current_database(), now()');
        console.log('Database Info:', res.rows[0]);

        const tables = ['users', 'neighborhoods', 'shops', 'ads', 'news'];
        for (const table of tables) {
            try {
                const count = await client.query(`SELECT COUNT(*) FROM "${table}"`);
                console.log(`Table "${table}" has ${count.rows[0].count} rows.`);
            } catch (e) {
                console.log(`Table "${table}" error: ${e.message}`);
            }
        }

        client.release();
    } catch (err) {
        console.error('❌ Connection error:', err.message);
        if (err.stack) console.error(err.stack);
    } finally {
        await pool.end();
    }
}

testConnection();
