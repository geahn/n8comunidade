const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Get Dashboard Data (News, Shops, Ads, Banners)
router.get('/', auth, async (req, res) => {
    const neighborhood_id = req.query.neighborhoodId || req.user.neighborhood_id;

    if (!neighborhood_id) {
        return res.status(400).json({ message: 'Neighborhood ID required' });
    }

    try {
        // Parallel queries for better performance
        const [news, ads, banners, topShops, randomShops] = await Promise.all([
            // Recent news
            db.query(
                'SELECT id, title, content, image_url, created_at FROM news WHERE neighborhood_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 5',
                [neighborhood_id, 'published']
            ),
            // Recent ads
            db.query(
                'SELECT id, title, price, images[1] as image_url, category FROM ads WHERE neighborhood_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 10',
                [neighborhood_id, 'active']
            ),
            // Mini banners
            db.query(
                'SELECT id, title, image_url, action_type, action_target FROM mini_banners WHERE neighborhood_id = $1 AND is_active = true ORDER BY order_index ASC',
                [neighborhood_id]
            ),
            // Top 3 shops by order count
            db.query(
                `SELECT s.id, s.name, s.logo_url, s.cover_url, s.rating, COUNT(o.id) as order_count 
                 FROM shops s 
                 LEFT JOIN orders o ON s.id = o.shop_id 
                 WHERE s.neighborhood_id = $1 AND s.status = $2 
                 GROUP BY s.id 
                 ORDER BY order_count DESC, s.created_at DESC 
                 LIMIT 3`,
                [neighborhood_id, 'active']
            ),
            // 2 random shops (excluding top shops if possible)
            // Note: Simplification here, just getting 2 random active ones for now
            db.query(
                'SELECT id, name, logo_url, cover_url, rating FROM shops WHERE neighborhood_id = $1 AND status = $2 ORDER BY RANDOM() LIMIT 2',
                [neighborhood_id, 'active']
            )
        ]);

        // Combine top and random shops, ensuring uniqueness if needed
        const shops = [...topShops.rows];
        const topIds = new Set(shops.map(s => s.id));

        randomShops.rows.forEach(s => {
            if (!topIds.has(s.id) && shops.length < 5) {
                shops.push(s);
            }
        });

        res.json({
            news: news.rows,
            ads: ads.rows,
            banners: banners.rows,
            shops: shops
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
