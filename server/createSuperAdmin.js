const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config();

async function createSuperAdmin() {
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: false
    });

    const email = 'contato@geahn.com';
    const fullName = 'Geahn Daniel';
    const password = 'maxadu07';

    try {
        await client.connect();
        console.log('Connected to PostgreSQL');

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const checkUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            console.log('Admin user already exists. Updating role to global_admin...');
            await client.query('UPDATE users SET role = $1 WHERE email = $2', ['global_admin', email]);
        } else {
            console.log('Creating superadmin user...');
            await client.query(
                'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4)',
                [email, passwordHash, fullName, 'global_admin']
            );
            console.log('Superadmin created successfully!');
        }

    } catch (err) {
        console.error('Error creating superadmin:', err.message);
    } finally {
        await client.end();
    }
}

createSuperAdmin();
