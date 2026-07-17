const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const { ROLES, ADMIN_ROLES } = require('../config/roles');

// Admin: list all users in neighborhood
router.get('/users', auth, requireRole(...ADMIN_ROLES), async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, email, full_name, role, created_at
       FROM users WHERE neighborhood_id = $1 ORDER BY created_at DESC`,
            [req.user.neighborhood_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('admin/users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: change user role
// Observação: superadmin NÃO é atribuível por esta rota — apenas outro
// superadmin pode promover, via script/rota dedicada e controlada.
router.patch('/users/:id/role', auth, requireRole(...ADMIN_ROLES), async (req, res) => {
    const { role } = req.body;
    const { id } = req.params;
    const assignableRoles = [ROLES.USER, ROLES.STORE_OWNER, ROLES.DRIVER, ROLES.ADMIN];
    if (!assignableRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' });

    // admin de bairro não pode criar outros admins; só superadmin pode
    if (role === ROLES.ADMIN && req.user.role !== ROLES.SUPERADMIN) {
        return res.status(403).json({ message: 'Apenas superadmin pode promover a admin' });
    }

    try {
        // Garante que o alvo pertence ao mesmo bairro (admin de bairro é escopado)
        const scope = req.user.role === ROLES.SUPERADMIN
            ? await db.query('UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, full_name, role', [role, id])
            : await db.query('UPDATE users SET role = $1 WHERE id = $2 AND neighborhood_id = $3 RETURNING id, email, full_name, role', [role, id, req.user.neighborhood_id]);

        if (scope.rows.length === 0) return res.status(404).json({ message: 'User not found in scope' });
        res.json(scope.rows[0]);
    } catch (err) {
        console.error('admin/role error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Superadmin: list all neighborhoods
router.get('/neighborhoods', auth, requireRole(ROLES.SUPERADMIN), async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM neighborhoods ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('admin/neighborhoods error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Superadmin: activate/deactivate neighborhood
router.patch('/neighborhoods/:id/status', auth, requireRole(ROLES.SUPERADMIN), async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    const validStatuses = ['pending', 'active', 'rejected'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    try {
        const result = await db.query(
            'UPDATE neighborhoods SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Neighborhood not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('admin/neighborhood status error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Superadmin: get global settings
router.get('/settings', auth, requireRole(ROLES.SUPERADMIN), async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM settings');
        res.json(result.rows);
    } catch (err) {
        console.error('admin/settings error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
