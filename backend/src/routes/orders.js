const express = require('express');
const { pool } = require('../db');
const { requireAuth, requireStaff, requireVerified } = require('../middleware');
const { sendOrderStatusEmail, sendNewOrderEmail } = require('../email');

const router = express.Router();

router.use(requireAuth);

// POST /api/orders — create order from cart (requires verified email)
router.post('/', requireVerified, async (req, res) => {
  const { shipping_address } = req.body;

  if (!shipping_address) {
    return res.status(400).json({ error: 'Shipping address is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get cart items with product info
    const { rows: cartItems } = await client.query(
      `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [req.user.id],
    );

    if (cartItems.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Verify stock for all items
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `Insufficient stock for ${item.name}. Available: ${item.stock}`,
        });
      }
    }

    // Calculate total
    const total = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0,
    );

    // Create order
    const {
      rows: [order],
    } = await client.query(
      'INSERT INTO orders (user_id, total, shipping_address) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, total.toFixed(2), shipping_address],
    );

    // Create order items and decrement stock
    for (const item of cartItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, item.price],
      );
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id],
      );
    }

    // Clear cart
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [
      req.user.id,
    ]);

    await client.query('COMMIT');

    // Email admin/managers about new order (non-blocking)
    const orderItems = cartItems.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    }));
    pool
      .query("SELECT email, name FROM users WHERE role IN ('admin', 'manager')")
      .then(({ rows: staff }) => {
        for (const s of staff) {
          sendNewOrderEmail(s.email, {
            name: s.name,
            total: order.total,
            customerName: req.user.name,
            customerEmail: req.user.email,
            items: orderItems,
            shippingAddress: shipping_address,
          }).catch((err) => console.error('New order email error:', err));
        }
      })
      .catch((err) => console.error('Staff query error:', err));

    res.status(201).json(order);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
  }
});

// GET /api/orders — list user's orders (or all orders for staff)
router.get('/', async (req, res) => {
  try {
    if (
      (req.user.role === 'admin' || req.user.role === 'manager') &&
      req.query.all === 'true'
    ) {
      const { rows } = await pool.query(
        `SELECT o.*, u.name AS user_name, u.email AS user_email,
                su.name AS status_updated_by_name
         FROM orders o
         JOIN users u ON o.user_id = u.id
         LEFT JOIN users su ON o.status_updated_by = su.id
         ORDER BY o.created_at DESC`,
      );
      return res.json(rows);
    }

    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id],
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/orders/:id — get order detail with items
router.get('/:id', async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      query = 'SELECT * FROM orders WHERE id = $1';
      params = [req.params.id];
    } else {
      query = 'SELECT * FROM orders WHERE id = $1 AND user_id = $2';
      params = [req.params.id, req.user.id];
    }

    const { rows: orders } = await pool.query(query, params);

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { rows: items } = await pool.query(
      `SELECT oi.*, p.name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [req.params.id],
    );

    res.json({ ...orders[0], items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/orders/:id/status — update order status (staff: admin or manager)
router.put('/:id/status', requireStaff, async (req, res) => {
  const { status } = req.body;
  const validStatuses = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ];

  if (!status || !validStatuses.includes(status)) {
    return res
      .status(400)
      .json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: orders } = await client.query(
      'SELECT * FROM orders WHERE id = $1 FOR UPDATE',
      [req.params.id],
    );

    if (orders.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }

    const oldStatus = orders[0].status;

    // Prevent changing a cancelled order
    if (oldStatus === 'cancelled') {
      await client.query('ROLLBACK');
      return res
        .status(400)
        .json({ error: 'Cannot change status of a cancelled order' });
    }

    // Cancelling — restore stock
    if (status === 'cancelled') {
      const { rows: items } = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [req.params.id],
      );
      for (const item of items) {
        await client.query(
          'UPDATE products SET stock = stock + $1 WHERE id = $2',
          [item.quantity, item.product_id],
        );
      }
    }

    const { rows: updated } = await client.query(
      'UPDATE orders SET status = $1, status_updated_by = $2, status_updated_at = NOW() WHERE id = $3 RETURNING *',
      [status, req.user.id, req.params.id],
    );

    await client.query('COMMIT');

    // Email customer about status change (non-blocking)
    const oid = parseInt(req.params.id);
    Promise.all([
      pool.query('SELECT email, name FROM users WHERE id = $1', [
        orders[0].user_id,
      ]),
      pool.query(
        `SELECT oi.quantity, oi.price, p.name
         FROM order_items oi JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [oid],
      ),
    ])
      .then(([userRes, itemsRes]) => {
        if (userRes.rows[0]) {
          sendOrderStatusEmail(userRes.rows[0].email, {
            name: userRes.rows[0].name,
            status,
            total: `$${orders[0].total}`,
            items: itemsRes.rows,
            shippingAddress: orders[0].shipping_address,
            orderDate: orders[0].created_at,
          }).catch((err) => console.error('Status email error:', err));
        }
      })
      .catch((err) => console.error('Customer query error:', err));

    res.json(updated[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
  }
});

module.exports = router;
