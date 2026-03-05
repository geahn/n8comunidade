const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// List news in neighborhood
router.get('/', auth, async (req, res) => {
    const { neighborhood_id } = req.user;
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
router.patch('/:id/status', auth, async (req, res) => {
    if (!['neighborhood_admin', 'global_admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const { status } = req.body;
    const { id } = req.params;
    try {
        const result = await db.query(
            'UPDATE news SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// List pending news (admin only)
router.get('/pending', auth, async (req, res) => {
    if (!['neighborhood_admin', 'global_admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
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
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
