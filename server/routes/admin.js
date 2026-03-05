const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Admin: list all users in neighborhood
router.get('/users', auth, async (req, res) => {
    if (!['neighborhood_admin', 'global_admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const result = await db.query(
            `SELECT id, email, full_name, role, created_at 
       FROM users WHERE neighborhood_id = $1 ORDER BY created_at DESC`,
            [req.user.neighborhood_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: change user role
router.patch('/users/:id/role', auth, async (req, res) => {
    if (!['neighborhood_admin', 'global_admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const { role } = req.body;
    const { id } = req.params;
    const validRoles = ['user', 'shopkeeper', 'neighborhood_admin'];
    if (!validRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    try {
        const result = await db.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, full_name, role',
            [role, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Superadmin: list all neighborhoods
router.get('/neighborhoods', auth, async (req, res) => {
    if (req.user.role !== 'global_admin') return res.status(403).json({ message: 'Forbidden' });
    try {
        const result = await db.query('SELECT * FROM neighborhoods ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Superadmin: activate/deactivate neighborhood
router.patch('/neighborhoods/:id/status', auth, async (req, res) => {
    if (req.user.role !== 'global_admin') return res.status(403).json({ message: 'Forbidden' });
    const { status } = req.body;
    const { id } = req.params;
    try {
        const result = await db.query(
            'UPDATE neighborhoods SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Superadmin: get global settings
router.get('/settings', auth, async (req, res) => {
    if (req.user.role !== 'global_admin') return res.status(403).json({ message: 'Forbidden' });
    try {
        const result = await db.query('SELECT * FROM settings');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
