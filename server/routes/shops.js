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

// Add a product to the shop menu (Store Owner)
router.post('/products', auth, async (req, res) => {
    if (req.user.role !== 'store_owner' && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const { shop_id, name, description, price, category, image_url, is_available } = req.body;

    try {
        // Verify ownership
        if (req.user.role === 'store_owner') {
            const shopCheck = await db.query('SELECT id FROM shops WHERE id = $1 AND owner_id = $2', [shop_id, req.user.id]);
            if (shopCheck.rows.length === 0) return res.status(403).json({ message: 'Not authorized for this shop' });
        }

        const result = await db.query(
            `INSERT INTO products (shop_id, name, description, price, category, image_url, is_available)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [shop_id, name, description, price, category, image_url, is_available !== undefined ? is_available : true]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a product
router.put('/products/:id', auth, async (req, res) => {
    if (req.user.role !== 'store_owner' && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, description, price, category, image_url, is_available } = req.body;
    const { id } = req.params;

    try {
        // Verify ownership
        if (req.user.role === 'store_owner') {
            const ownerCheck = await db.query(
                `SELECT s.owner_id FROM products p JOIN shops s ON p.shop_id = s.id WHERE p.id = $1`,
                [id]
            );
            if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].owner_id !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized' });
            }
        }

        const result = await db.query(
            `UPDATE products 
             SET name = COALESCE($1, name), 
                 description = COALESCE($2, description), 
                 price = COALESCE($3, price), 
                 category = COALESCE($4, category), 
                 image_url = COALESCE($5, image_url), 
                 is_available = COALESCE($6, is_available),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 RETURNING *`,
            [name, description, price, category, image_url, is_available, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a product
router.delete('/products/:id', auth, async (req, res) => {
    if (req.user.role !== 'store_owner' && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const { id } = req.params;

    try {
        if (req.user.role === 'store_owner') {
            const ownerCheck = await db.query(
                `SELECT s.owner_id FROM products p JOIN shops s ON p.shop_id = s.id WHERE p.id = $1`,
                [id]
            );
            if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].owner_id !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized' });
            }
        }

        const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });

        res.json({ message: 'Product deleted successfully', id: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
