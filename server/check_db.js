const { Client } = require('pg');
require('dotenv').config({ path: './.env' });

async function checkDb() {
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        await client.connect();

        console.log('\n--- TABLE COUNTS ---');
        const counts = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM neighborhoods) as neighborhoods,
                (SELECT COUNT(*) FROM shops) as shops,
                (SELECT COUNT(*) FROM news) as news,
                (SELECT COUNT(*) FROM ads) as ads,
                (SELECT COUNT(*) FROM users) as users,
                (SELECT COUNT(*) FROM orders) as orders,
                (SELECT COUNT(*) FROM mini_banners) as mini_banners
        `);
        console.log(counts.rows[0]);

        console.log('\n--- DATA DETAILS ---');
        const standardTables = ['shops', 'news', 'ads'];
        for (const table of standardTables) {
            const res = await client.query('SELECT id, neighborhood_id, status FROM ' + table);
            console.log('Details ' + table + ':', res.rows);
        }

        const bannerRes = await client.query('SELECT id, neighborhood_id, is_active FROM mini_banners');
        console.log('Details mini_banners:', bannerRes.rows);

        console.log('\n--- NEIGHBORHOODS ---');
        const neighborhoods = await client.query('SELECT * FROM neighborhoods');
        console.log(neighborhoods.rows);

        await client.end();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDb();
