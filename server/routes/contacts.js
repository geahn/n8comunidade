const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// List contacts in neighborhood
router.get('/', auth, async (req, res) => {
    const { neighborhood_id } = req.user;
    try {
        const result = await db.query(
            'SELECT * FROM contacts WHERE neighborhood_id = $1 ORDER BY category, name',
            [neighborhood_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add contact (admin only)
router.post('/', auth, async (req, res) => {
    if (!['neighborhood_admin', 'global_admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const { category, name, phone, address } = req.body;
    const { neighborhood_id } = req.user;
    try {
        const result = await db.query(
            'INSERT INTO contacts (neighborhood_id, category, name, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [neighborhood_id, category, name, phone, address]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
