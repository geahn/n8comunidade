const db = require('./db');

async function checkData() {
    try {
        const shops = await db.query('SELECT id, name FROM shops');
        console.log('Shops:', shops.rows.length);

        const orders = await db.query('SELECT shop_id, count(*) as count FROM orders GROUP BY shop_id ORDER BY count DESC');
        console.log('Orders per shop:', orders.rows);

        const ads = await db.query('SELECT count(*) FROM ads');
        console.log('Ads:', ads.rows[0].count);

        const news = await db.query('SELECT count(*) FROM news');
        console.log('News:', news.rows[0].count);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
