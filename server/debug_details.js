const db = require('./db');

async function debugDetails() {
    try {
        const neighborhoods = await db.query('SELECT * FROM neighborhoods');
        console.log('Neighborhoods:', JSON.stringify(neighborhoods.rows, null, 2));

        const shops = await db.query('SELECT name, neighborhood_id FROM shops');
        console.log('Shops:', JSON.stringify(shops.rows, null, 2));

        const users = await db.query('SELECT email, neighborhood_id FROM users');
        console.log('Users:', JSON.stringify(users.rows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugDetails();
