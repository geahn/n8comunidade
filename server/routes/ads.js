const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// List ads in neighborhood
router.get('/', auth, async (req, res) => {
    const neighborhood_id = req.query.neighborhoodId || req.user.neighborhood_id;

    if (!neighborhood_id) {
        return res.status(400).json({ message: 'Neighborhood ID required' });
    }

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

// Get user's ads
router.get('/user', auth, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM ads WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update an ad
router.put('/:id', auth, async (req, res) => {
    const { title, description, price, category, images, status } = req.body;
    try {
        const adCheck = await db.query('SELECT * FROM ads WHERE id = $1', [req.params.id]);
        if (adCheck.rows.length === 0) return res.status(404).json({ message: 'Ad not found' });

        if (adCheck.rows[0].user_id !== req.user.id && req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const result = await db.query(
            'UPDATE ads SET title = $1, description = $2, price = $3, category = $4, images = $5, status = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
            [title, description, price, category, images, status, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete an ad
router.delete('/:id', auth, async (req, res) => {
    try {
        const adCheck = await db.query('SELECT * FROM ads WHERE id = $1', [req.params.id]);
        if (adCheck.rows.length === 0) return res.status(404).json({ message: 'Ad not found' });

        if (adCheck.rows[0].user_id !== req.user.id && req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await db.query('DELETE FROM ads WHERE id = $1', [req.params.id]);
        res.json({ message: 'Ad deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
