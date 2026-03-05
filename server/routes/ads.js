const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// List ads in neighborhood
router.get('/', auth, async (req, res) => {
    const { neighborhood_id } = req.user;
    try {
        const result = await db.query(
            'SELECT * FROM ads WHERE neighborhood_id = $1 AND status = $2 ORDER BY created_at DESC',
            [neighborhood_id, 'active']
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Post a new ad
router.post('/', auth, async (req, res) => {
    const { title, description, price, category, images } = req.body;
    const { id: user_id, neighborhood_id } = req.user;

    try {
        // Check monthly limit (mock logic for now)
        const countResult = await db.query(
            'SELECT COUNT(*) FROM ads WHERE user_id = $1 AND created_at > NOW() - INTERVAL \'1 month\'',
            [user_id]
        );

        if (parseInt(countResult.rows[0].count) >= 5) { // Limit 5 free ads
            return res.status(403).json({ message: 'Monthly ad limit reached. Upgrade to post more.' });
        }

        const result = await db.query(
            'INSERT INTO ads (user_id, neighborhood_id, title, description, price, category, images) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [user_id, neighborhood_id, title, description, price, category, images]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
