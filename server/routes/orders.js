const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Create a new order (Checkout Flow)
router.post('/', auth, async (req, res) => {
    const { shop_id, items, delivery_address, delivery_fee, payment_method, notes } = req.body;

    if (!shop_id || !items || items.length === 0 || !delivery_address) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        await db.query('BEGIN'); // Start transaction

        // 1. Calculate total amount
        let total_amount = parseFloat(delivery_fee) || 0;

        // 2. Insert Order
        const orderResult = await db.query(
            `INSERT INTO orders (shop_id, user_id, status, total_amount, delivery_fee, delivery_address, payment_method, notes) 
             VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7) RETURNING *`,
            [shop_id, req.user.id, total_amount, delivery_fee || 0, delivery_address, payment_method, notes]
        );
        const orderId = orderResult.rows[0].id;

        // 3. Process items and update total amount
        let itemsTotal = 0;
        for (const item of items) {
            const productRes = await db.query('SELECT price FROM products WHERE id = $1', [item.product_id]);
            if (productRes.rows.length === 0) continue;

            const unit_price = productRes.rows[0].price;
            itemsTotal += (unit_price * item.quantity);

            await db.query(
                `INSERT INTO order_items (order_id, product_id, quantity, unit_price, special_instructions) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [orderId, item.product_id, item.quantity, unit_price, item.special_instructions]
            );
        }

        // Finalize total
        total_amount += itemsTotal;
        const finalOrder = await db.query(
            `UPDATE orders SET total_amount = $1 WHERE id = $2 RETURNING *`,
            [total_amount, orderId]
        );

        await db.query('COMMIT');

        // TODO: Emit WebSocket event to shop owner here

        res.status(201).json(finalOrder.rows[0]);
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Create order error:', err);
        res.status(500).json({ message: 'Server error processing order' });
    }
});

// Get user orders
router.get('/user', auth, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT o.*, s.name as shop_name, s.logo_url as shop_logo 
             FROM orders o 
             JOIN shops s ON o.shop_id = s.id 
             WHERE o.user_id = $1 
             ORDER BY o.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get shop orders (For store owner panel)
router.get('/shop/:shop_id', auth, async (req, res) => {
    // Basic verification: user is owner or admin
    if (req.user.role !== 'store_owner' && req.user.role !== 'superadmin' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        // Fetch orders
        const result = await db.query(
            `SELECT o.*, u.full_name as customer_name 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             WHERE o.shop_id = $1 
             ORDER BY o.created_at DESC`,
            [req.params.shop_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Order Status (Store owner)
router.put('/:id/status', auth, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const result = await db.query(
            `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [status, req.params.id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Order not found' });

        // TODO: Emit WebSocket event to customer here

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Assign Driver (Driver App)
router.put('/:id/assign-driver', auth, async (req, res) => {
    if (req.user.role !== 'driver' && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Forbidden: Only drivers can accept orders' });
    }

    try {
        const result = await db.query(
            `UPDATE orders SET driver_id = $1, status = 'out_for_delivery', updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND status = 'ready' RETURNING *`,
            [req.user.id, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Order not found or not ready for delivery' });
        }

        // TODO: Emit WebSocket event to customer and shop here

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get order details + items
router.get('/:id', auth, async (req, res) => {
    try {
        const orderRes = await db.query(
            `SELECT o.*, s.name as shop_name, s.logo_url as shop_logo, u.full_name as customer_name, d.full_name as driver_name
             FROM orders o 
             JOIN shops s ON o.shop_id = s.id 
             JOIN users u ON o.user_id = u.id 
             LEFT JOIN users d ON o.driver_id = d.id
             WHERE o.id = $1`,
            [req.params.id]
        );

        if (orderRes.rows.length === 0) return res.status(404).json({ message: 'Order not found' });

        const order = orderRes.rows[0];

        // Ensure user is authorized to view this order
        if (req.user.role === 'user' && order.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        } // More granular checks needed here generally

        const itemsRes = await db.query(
            `SELECT oi.*, p.name, p.image_url 
             FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = $1`,
            [req.params.id]
        );

        res.json({ ...order, items: itemsRes.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get orders for driver
router.get('/driver/all', auth, async (req, res) => {
    if (req.user.role !== 'driver' && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        const result = await db.query(
            `SELECT o.*, s.name as shop_name, s.logo_url as shop_logo, s.address as shop_address 
             FROM orders o 
             JOIN shops s ON o.shop_id = s.id 
             WHERE (o.status = 'ready' AND o.driver_id IS NULL) 
                OR (o.driver_id = $1 AND o.status IN ('out_for_delivery', 'delivered'))
             ORDER BY o.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
