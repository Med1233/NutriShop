const express = require('express');
const { pool } = require('../db');
const { requireAuth, requireProductManager } = require('../middleware');

const router = express.Router();

// GET /api/products — list all products, optionally filter by category
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/products/categories — list distinct categories
router.get('/categories', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
    res.json(rows.map(r => r.category));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/products/:id — get single product
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Admin-only endpoints ────────────────────────────────────────────

// POST /api/products — create a product (admin only)
router.post('/', requireAuth, requireProductManager, async (req, res) => {
  try {
    const { name, description, price, image_url, category, stock, nutrition_info } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO products (name, description, price, image_url, category, stock, nutrition_info)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description || '', price, image_url || '', category, stock || 0, nutrition_info ? JSON.stringify(nutrition_info) : null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/products/:id — update a product (admin only)
router.put('/:id', requireAuth, requireProductManager, async (req, res) => {
  try {
    const { name, description, price, image_url, category, stock, nutrition_info } = req.body;

    const { rows } = await pool.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        image_url = COALESCE($4, image_url),
        category = COALESCE($5, category),
        stock = COALESCE($6, stock),
        nutrition_info = COALESCE($7, nutrition_info)
       WHERE id = $8 RETURNING *`,
      [name, description, price, image_url, category, stock, nutrition_info ? JSON.stringify(nutrition_info) : null, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/products/:id — delete a product (admin only)
router.delete('/:id', requireAuth, requireProductManager, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
