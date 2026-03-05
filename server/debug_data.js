const db = require('./db');

async function checkData() {
    try {
        const neighborhoods = await db.query('SELECT id, name FROM neighborhoods');
        console.log('Neighborhoods:', neighborhoods.rows);

        const shops = await db.query('SELECT id, name, neighborhood_id FROM shops');
        console.log('Shops count:', shops.rows.length);
        if (shops.rows.length > 0) {
            console.log('Sample Shop Neighborhood ID:', shops.rows[0].neighborhood_id);
        }

        const news = await db.query('SELECT count(*) FROM news');
        console.log('News count:', news.rows[0].count);

        const ads = await db.query('SELECT count(*) FROM ads');
        console.log('Ads count:', ads.rows[0].count);

        const miniBanners = await db.query('SELECT count(*) FROM mini_banners');
        console.log('Mini Banners count:', miniBanners.rows[0].count);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
