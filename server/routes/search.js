const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Unified Search (Shops, News, Ads)
router.get('/', auth, async (req, res) => {
    const { q } = req.query;
    const neighborhood_id = req.query.neighborhoodId || req.user.neighborhood_id;

    if (!q) {
        return res.status(400).json({ message: 'Query parameter q is required' });
    }

    if (!neighborhood_id) {
        return res.status(400).json({ message: 'Neighborhood ID required' });
    }

    const searchTerm = `%${q}%`;

    try {
        const [shops, news, ads] = await Promise.all([
            // Search in Shops
            db.query(
                'SELECT id, name as title, logo_url as image_url, rating, $1 as type FROM shops WHERE neighborhood_id = $3 AND (name ILIKE $2 OR description ILIKE $2) AND status = $4 LIMIT 5',
                ['shop', searchTerm, neighborhood_id, 'active']
            ),
            // News results
            db.query(
                'SELECT id, title, image_url, $1 as type FROM news WHERE neighborhood_id = $3 AND (title ILIKE $2 OR content ILIKE $2) AND status = $4 LIMIT 5',
                ['news', searchTerm, neighborhood_id, 'published']
            ),
            // Ads results
            db.query(
                'SELECT id, title, price, images[1] as image_url, $1 as type FROM ads WHERE neighborhood_id = $3 AND (title ILIKE $2 OR description ILIKE $2) AND status = $4 LIMIT 5',
                ['ad', searchTerm, neighborhood_id, 'active']
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
