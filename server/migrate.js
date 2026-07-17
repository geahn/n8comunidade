// Runner de migrations: aplica os arquivos de ./migrations em ordem,
// registrando cada um em schema_migrations. Cada migration roda em transação.
// Uso: node migrate.js
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrate() {
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

        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                name VARCHAR(255) PRIMARY KEY,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const dir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

        const appliedRes = await client.query('SELECT name FROM schema_migrations');
        const applied = new Set(appliedRes.rows.map(r => r.name));

        let ran = 0;
        for (const file of files) {
            if (applied.has(file)) continue;

            const sql = fs.readFileSync(path.join(dir, file), 'utf8');
            console.log(`Applying ${file}...`);
            try {
                await client.query('BEGIN');
                await client.query(sql);
                await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
                await client.query('COMMIT');
                ran++;
            } catch (err) {
                await client.query('ROLLBACK');
                throw new Error(`Migration ${file} failed: ${err.message}`);
            }
        }

        console.log(ran === 0 ? 'Nothing to migrate — up to date.' : `Applied ${ran} migration(s).`);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exitCode = 1;
    } finally {
        await client.end();
    }
}

migrate();
