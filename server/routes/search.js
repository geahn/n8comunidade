const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Unified Search (Shops, News, Ads)
router.get('/', auth, async (req, res) => {
    const { neighborhood_id } = req.user;
    const { q } = req.query;

    if (!q) {
        return res.json([]);
    }

    if (!neighborhood_id) {
        return res.status(400).json({ message: 'User not associated with a neighborhood' });
    }

    const searchTerm = `%${q}%`;

    try {
        const [shops, news, ads] = await Promise.all([
            // Search in Shops
            db.query(
                `SELECT id, name as title, 'shop' as type, logo_url as image_url, rating 
                 FROM shops 
                 WHERE neighborhood_id = $1 AND status = 'active' AND (name ILIKE $2 OR description ILIKE $2) 
                 LIMIT 5`,
                [neighborhood_id, searchTerm]
            ),
            // Search in News
            db.query(
                `SELECT id, title, 'news' as type, image_url, created_at 
                 FROM news 
                 WHERE neighborhood_id = $1 AND status = 'published' AND (title ILIKE $2 OR content ILIKE $2) 
                 LIMIT 5`,
                [neighborhood_id, searchTerm]
            ),
            // Search in Ads
            db.query(
                `SELECT id, title, 'ad' as type, images[1] as image_url, price 
                 FROM ads 
                 WHERE neighborhood_id = $1 AND status = 'active' AND (title ILIKE $2 OR description ILIKE $2) 
                 LIMIT 5`,
                [neighborhood_id, searchTerm]
            )
        ]);

        // Combine and return results
        const results = [
            ...shops.rows,
            ...news.rows,
            ...ads.rows
        ];

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
