const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { body, validationResult } = require('express-validator');

// Signup
router.post('/signup', [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('full_name').notEmpty(),
    body('neighborhood_id').isUUID().optional()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, full_name, neighborhood_id } = req.body;

    try {
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const result = await db.query(
            'INSERT INTO users (email, password_hash, full_name, neighborhood_id) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role, neighborhood_id',
            [email, passwordHash, full_name, neighborhood_id || null]
        );

        const userId = result.rows[0].id;
        const finalResult = await db.query(
            'SELECT u.id, u.email, u.full_name, u.role, u.neighborhood_id, n.name as neighborhood_name ' +
            'FROM users u LEFT JOIN neighborhoods n ON u.neighborhood_id = n.id ' +
            'WHERE u.id = $1',
            [userId]
        );

        const user = finalResult.rows[0];
        const token = jwt.sign({ id: user.id, role: user.role, neighborhood_id: user.neighborhood_id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log(`Login attempt for email: ${email}`);
        const result = await db.query(
            'SELECT u.id, u.email, u.password_hash, u.full_name, u.role, u.neighborhood_id, n.name as neighborhood_name ' +
            'FROM users u LEFT JOIN neighborhoods n ON u.neighborhood_id = n.id ' +
            'WHERE u.email = $1',
            [email]
        );
        console.log(`User query result rows: ${result.rows.length}`);
        if (result.rows.length === 0) {
            console.log('Login failed: User not found');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        console.log(`Comparing password for user: ${user.email}`);
        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log(`Password match result: ${isMatch}`);
        if (!isMatch) {
            console.log('Login failed: Invalid password');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role, neighborhood_id: user.neighborhood_id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        delete user.password_hash;
        res.json({ user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
const auth = require('../middleware/auth');

// Impersonate
router.post('/impersonate', auth, async (req, res) => {
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Forbidden: Superadmin access required.' });
    }

    const { target_user_id } = req.body;
    try {
        const result = await db.query(
            'SELECT u.id, u.email, u.full_name, u.role, u.neighborhood_id, n.name as neighborhood_name ' +
            'FROM users u LEFT JOIN neighborhoods n ON u.neighborhood_id = n.id ' +
            'WHERE u.id = $1',
            [target_user_id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, role: user.role, neighborhood_id: user.neighborhood_id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
