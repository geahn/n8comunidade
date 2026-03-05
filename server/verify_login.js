const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config({ path: './.env' });

async function verifyLogin() {
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        await client.connect();
        const email = 'contato@geahn.com';
        const password = 'maxadu07';

        const res = await client.query('SELECT password_hash FROM users WHERE email = $1', [email]);
        if (res.rows.length === 0) {
            console.log('User not found');
        } else {
            const hash = res.rows[0].password_hash;
            const isMatch = await bcrypt.compare(password, hash);
            console.log('Password match:', isMatch);
            console.log('Hash:', hash);
        }
        await client.end();
    } catch (err) {
        console.error(err);
    }
}

verifyLogin();
