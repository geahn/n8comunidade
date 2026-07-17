// Bootstrap manual de superadmin — único caminho para criar/promover superadmin.
// Uso: node createSuperAdmin.js <email> <senha> [nome completo]
const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config();

async function createSuperAdmin() {
    const [email, password, ...nameParts] = process.argv.slice(2);
    const fullName = nameParts.join(' ') || 'Superadmin';

    if (!email || !password) {
        console.error('Uso: node createSuperAdmin.js <email> <senha> [nome completo]');
        process.exit(1);
    }

    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: false
    });

    try {
        await client.connect();

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const checkUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            await client.query(
                'UPDATE users SET role = $1, password_hash = $2 WHERE email = $3',
                ['superadmin', passwordHash, email]
            );
            console.log(`Usuário ${email} promovido a superadmin (senha atualizada).`);
        } else {
            await client.query(
                'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4)',
                [email, passwordHash, fullName, 'superadmin']
            );
            console.log(`Superadmin ${email} criado com sucesso.`);
        }
    } catch (err) {
        console.error('Erro:', err.message);
        process.exitCode = 1;
    } finally {
        await client.end();
    }
}

createSuperAdmin();
