const db = require('./db');

async function fixUser() {
    try {
        const nRes = await db.query('SELECT id FROM neighborhoods LIMIT 1');
        if (nRes.rows.length === 0) {
            console.log('No neighborhoods found');
            process.exit(1);
        }
        const nId = nRes.rows[0].id;
        console.log('Target Neighborhood ID:', nId);

        const uRes = await db.query("UPDATE users SET neighborhood_id = $1 WHERE email = 'contato@geahn.com' RETURNING email, neighborhood_id", [nId]);
        console.log('Updated User:', uRes.rows[0]);

        // Also ensure there are some news, shops and ads for this neighborhood
        await db.query('UPDATE news SET neighborhood_id = $1', [nId]);
        await db.query('UPDATE shops SET neighborhood_id = $1', [nId]);
        await db.query('UPDATE ads SET neighborhood_id = $1', [nId]);
        await db.query('UPDATE mini_banners SET neighborhood_id = $1', [nId]);

        console.log('Data associated with neighborhood:', nId);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixUser();
