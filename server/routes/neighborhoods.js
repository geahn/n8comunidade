const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all active neighborhoods — público: necessário para o signup
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, name, slug FROM neighborhoods WHERE status = $1 ORDER BY name ASC',
            ['active']
        );
        res.json(result.rows);
    } catch (err) {
        console.error('neighborhoods list error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
