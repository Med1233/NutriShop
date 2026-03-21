const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware');

const router = express.Router();

// All cart routes require authentication
router.use(requireAuth);

// Prevent Chrome from caching cart responses
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// GET /api/cart — get user's cart with product details
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.image_url, p.category, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at`,
      [req.user.id],
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/cart — add item to cart (or increment quantity)
router.post('/', async (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'product_id is required' });
  }
  if (quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }

  try {
    // Check product exists and has stock
    const { rows: products } = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [product_id],
    );
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (products[0].stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Upsert: add or increment
    const { rows } = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + $3
       RETURNING *`,
      [req.user.id, product_id, quantity],
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/cart/:id — update cart item quantity
router.put('/:id', async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE cart_items SET quantity = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [quantity, req.params.id, req.user.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/cart/:id — remove item from cart
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id],
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
