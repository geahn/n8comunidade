const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Get Dashboard Data (News, Shops, Ads)
router.get('/', auth, async (req, res) => {
    const { neighborhood_id } = req.user;

    if (!neighborhood_id) {
        return res.status(400).json({ message: 'User not associated with a neighborhood' });
    }

    try {
        // Parallel queries for better performance
        const [news, shops, ads] = await Promise.all([
            db.query(
                'SELECT id, title, content, image_url, created_at FROM news WHERE neighborhood_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 5',
                [neighborhood_id, 'published']
            ),
            db.query(
                'SELECT id, name, description, logo_url, rating FROM shops WHERE neighborhood_id = $1 AND status = $2 LIMIT 10',
                [neighborhood_id, 'active']
            ),
            db.query(
                'SELECT id, title, price, images[1] as image_url FROM ads WHERE neighborhood_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 5',
                [neighborhood_id, 'active']
            )
        ]);

        res.json({
            news: news.rows,
            shops: shops.rows,
            ads: ads.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
