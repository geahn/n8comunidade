const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// List all neighborhoods (mostly for signup selection)
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, slug, status FROM neighborhoods WHERE status = $1', ['active']);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Request new neighborhood
router.post('/request', auth, async (req, res) => {
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    try {
        const result = await db.query(
            'INSERT INTO neighborhoods (name, slug, status) VALUES ($1, $2, $3) RETURNING *',
            [name, slug, 'pending']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
