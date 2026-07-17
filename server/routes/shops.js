const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { requireRole, requireShopOwnership } = require('../middleware/authorize');
const { ROLES } = require('../config/roles');

// List shops in neighborhood
router.get('/', auth, async (req, res) => {
    const neighborhood_id = req.query.neighborhoodId || req.user.neighborhood_id;

    if (!neighborhood_id) {
        return res.status(400).json({ message: 'Neighborhood ID required' });
    }

    try {
        const result = await db.query(
            'SELECT * FROM shops WHERE neighborhood_id = $1 AND status = $2',
            [neighborhood_id, 'active']
        );
        res.json(result.rows);
    } catch (err) {
        console.error('shops list error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get my shop (store owner panel) — retorna loja + produtos do dono logado
router.get('/mine', auth, async (req, res) => {
    try {
        const shopResult = await db.query('SELECT * FROM shops WHERE owner_id = $1 ORDER BY created_at ASC LIMIT 1', [req.user.id]);
        if (shopResult.rows.length === 0) return res.status(404).json({ message: 'Você ainda não tem loja' });

        const shop = shopResult.rows[0];
        const productsResult = await db.query('SELECT * FROM products WHERE shop_id = $1 ORDER BY created_at DESC', [shop.id]);
        res.json({ shop, products: productsResult.rows });
    } catch (err) {
        console.error('shops/mine error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// List pending shops (admin approval queue)
router.get('/pending', auth, requireRole(ROLES.ADMIN, ROLES.SUPERADMIN), async (req, res) => {
    try {
        const params = [];
        let where = `s.status = 'pending'`;
        // Admin de bairro só vê as lojas do próprio bairro
        if (req.user.role === ROLES.ADMIN) {
            params.push(req.user.neighborhood_id);
            where += ` AND s.neighborhood_id = $1`;
        }
        const result = await db.query(
            `SELECT s.*, u.full_name as owner_name, u.email as owner_email
             FROM shops s JOIN users u ON s.owner_id = u.id
             WHERE ${where} ORDER BY s.created_at ASC`,
            params
        );
        res.json(result.rows);
    } catch (err) {
        console.error('shops/pending error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Request a shop (any user) — entra como pending até aprovação do admin
router.post('/', auth, async (req, res) => {
    const { name, description, logo_url, cover_url, address, latitude, longitude, business_hours } = req.body;
    if (!name) return res.status(400).json({ message: 'name é obrigatório' });
    if (!req.user.neighborhood_id) return res.status(400).json({ message: 'Usuário sem bairro definido' });

    try {
        const result = await db.query(
            `INSERT INTO shops (neighborhood_id, owner_id, name, description, logo_url, cover_url, address, latitude, longitude, business_hours, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending') RETURNING *`,
            [req.user.neighborhood_id, req.user.id, name, description, logo_url, cover_url, address, latitude, longitude, business_hours]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('shops create error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Approve/reject shop (admin) — na aprovação, promove o dono a store_owner
router.patch('/:id/status', auth, requireRole(ROLES.ADMIN, ROLES.SUPERADMIN), async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'active', 'rejected'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    try {
        // Admin de bairro só gerencia lojas do próprio bairro
        const scopeParams = [status, req.params.id];
        let scopeWhere = 'id = $2';
        if (req.user.role === ROLES.ADMIN) {
            scopeParams.push(req.user.neighborhood_id);
            scopeWhere += ' AND neighborhood_id = $3';
        }

        const result = await db.query(
            `UPDATE shops SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE ${scopeWhere} RETURNING *`,
            scopeParams
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Shop not found in scope' });

        const shop = result.rows[0];
        // Loja aprovada => dono vira store_owner (se ainda for user comum)
        if (status === 'active') {
            await db.query(
                `UPDATE users SET role = 'store_owner' WHERE id = $1 AND role = 'user'`,
                [shop.owner_id]
            );
        }

        res.json(shop);
    } catch (err) {
        console.error('shops status error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update my shop (owner)
router.put('/:id', auth, requireRole(ROLES.STORE_OWNER, ROLES.SUPERADMIN), async (req, res) => {
    const { name, description, logo_url, cover_url, address, latitude, longitude, business_hours } = req.body;
    try {
        const ownWhere = req.user.role === ROLES.SUPERADMIN ? 'id = $8' : 'id = $8 AND owner_id = $9';
        const params = [name, description, logo_url, cover_url, address, latitude, longitude, req.params.id];
        if (req.user.role !== ROLES.SUPERADMIN) params.push(req.user.id);

        const result = await db.query(
            `UPDATE shops SET
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                logo_url = COALESCE($3, logo_url),
                cover_url = COALESCE($4, cover_url),
                address = COALESCE($5, address),
                latitude = COALESCE($6, latitude),
                longitude = COALESCE($7, longitude),
                updated_at = CURRENT_TIMESTAMP
             WHERE ${ownWhere} RETURNING *`,
            params
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Shop not found or not yours' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('shops update error:', err);
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
        console.error('shop detail error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a product to the shop menu (Store Owner)
router.post('/products', auth, requireRole(ROLES.STORE_OWNER, ROLES.SUPERADMIN), requireShopOwnership('body', 'shop_id'), async (req, res) => {
    const { shop_id, name, description, price, category, image_url, is_available } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ message: 'name e price são obrigatórios' });
    }

    try {
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
router.put('/products/:id', auth, requireRole(ROLES.STORE_OWNER, ROLES.SUPERADMIN), async (req, res) => {
    const { name, description, price, category, image_url, is_available } = req.body;
    const { id } = req.params;

    try {
        // Verify ownership (produto -> loja -> dono)
        if (req.user.role === ROLES.STORE_OWNER) {
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
router.delete('/products/:id', auth, requireRole(ROLES.STORE_OWNER, ROLES.SUPERADMIN), async (req, res) => {
    const { id } = req.params;

    try {
        if (req.user.role === ROLES.STORE_OWNER) {
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
