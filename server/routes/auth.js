const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { ROLES } = require('../config/roles');

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
router.post('/login', [
    body('email').isEmail(),
    body('password').notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid credentials' });

    const { email, password } = req.body;

    try {
        const result = await db.query(
            'SELECT u.id, u.email, u.password_hash, u.full_name, u.role, u.neighborhood_id, n.name as neighborhood_name ' +
            'FROM users u LEFT JOIN neighborhoods n ON u.neighborhood_id = n.id ' +
            'WHERE u.email = $1',
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
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
const crypto = require('crypto');

// Forgot password — gera token de redefinição (1h). Sem serviço de e-mail ainda:
// em dev o token volta na resposta; em produção deve ser enviado por e-mail.
router.post('/forgot-password', [body('email').isEmail()], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'E-mail inválido' });

    const { email } = req.body;
    // Resposta sempre genérica para não revelar se o e-mail existe
    const generic = { message: 'Se o e-mail existir, enviaremos instruções de redefinição.' };

    try {
        const userRes = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) return res.json(generic);

        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        await db.query(
            `INSERT INTO password_resets (user_id, token_hash, expires_at)
             VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
            [userRes.rows[0].id, tokenHash]
        );

        // TODO: enviar por e-mail quando houver provedor configurado
        if (process.env.NODE_ENV !== 'production') {
            return res.json({ ...generic, dev_token: token });
        }
        res.json(generic);
    } catch (err) {
        console.error('forgot-password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset password — consome o token e define a nova senha
router.post('/reset-password', [
    body('token').notEmpty(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Dados inválidos' });

    const { token, password } = req.body;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    try {
        const resetRes = await db.query(
            `SELECT user_id FROM password_resets
             WHERE token_hash = $1 AND expires_at > NOW() AND used_at IS NULL`,
            [tokenHash]
        );
        if (resetRes.rows.length === 0) return res.status(400).json({ message: 'Token inválido ou expirado' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, resetRes.rows[0].user_id]);
        await db.query('UPDATE password_resets SET used_at = NOW() WHERE token_hash = $1', [tokenHash]);

        res.json({ message: 'Senha redefinida com sucesso' });
    } catch (err) {
        console.error('reset-password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Impersonate
router.post('/impersonate', auth, async (req, res) => {
    if (req.user.role !== ROLES.SUPERADMIN) {
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
