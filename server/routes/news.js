const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const { ADMIN_ROLES } = require('../config/roles');

// List news in neighborhood
router.get('/', auth, async (req, res) => {
    const neighborhood_id = req.query.neighborhoodId || req.user.neighborhood_id;

    if (!neighborhood_id) {
        return res.status(400).json({ message: 'Neighborhood ID required' });
    }

    try {
        const result = await db.query(
            `SELECT n.*, u.full_name as author_name 
       FROM news n LEFT JOIN users u ON n.author_id = u.id
       WHERE n.neighborhood_id = $1 AND n.status = 'published'
       ORDER BY n.created_at DESC`,
            [neighborhood_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Suggest a news article
router.post('/', auth, async (req, res) => {
    const { title, content, category, image_url } = req.body;
    const { id: author_id, neighborhood_id } = req.user;
    try {
        const result = await db.query(
            'INSERT INTO news (neighborhood_id, author_id, title, content, category, image_url, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [neighborhood_id, author_id, title, content, category, image_url, 'pending']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin approve/reject
router.patch('/:id/status', auth, requireRole(...ADMIN_ROLES), async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    const validStatuses = ['pending', 'published', 'rejected'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    try {
        const result = await db.query(
            'UPDATE news SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'News not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('news status error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// List pending news (admin only)
router.get('/pending', auth, requireRole(...ADMIN_ROLES), async (req, res) => {
    try {
        const result = await db.query(
            `SELECT n.*, u.full_name as author_name FROM news n 
       LEFT JOIN users u ON n.author_id = u.id
       WHERE n.neighborhood_id = $1 AND n.status = 'pending'
       ORDER BY n.created_at DESC`,
            [req.user.neighborhood_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('news pending error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
