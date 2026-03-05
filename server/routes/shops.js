const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// List shops in neighborhood
router.get('/', auth, async (req, res) => {
    const { neighborhood_id } = req.user;
    try {
        const result = await db.query(
            'SELECT * FROM shops WHERE neighborhood_id = $1 AND status = $2',
            [neighborhood_id, 'active']
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get shop details and products
router.get('/:id', auth, async (req, res) => {
    const { id } = req.params;
    try {
        const shopResult = await db.query('SELECT * FROM shops WHERE id = $1', [id]);
        if (shopResult.rows.length === 0) return res.status(404).json({ message: 'Shop not found' });

        const productsResult = await db.query('SELECT * FROM products WHERE shop_id = $1 AND is_available = TRUE', [id]);

        res.json({
            shop: shopResult.rows[0],
            products: productsResult.rows
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
