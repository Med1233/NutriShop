const express = require('express');
const { pool } = require('../db');
const { hashPassword } = require('../auth');
const { requireAuth, requireAdmin } = require('../middleware');

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

// GET /api/admin/users — list all users
router.get('/users', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, role, provider, created_at FROM users ORDER BY id',
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/admin/users — create a user
router.post('/users', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const validRoles = ['customer', 'manager', 'stockist', 'admin'];

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 8 characters' });
    }

    if (role && !validRoles.includes(role)) {
      return res
        .status(400)
        .json({ error: `Role must be one of: ${validRoles.join(', ')}` });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, provider)
       VALUES ($1, $2, $3, $4, 'local') RETURNING id, email, name, role, provider, created_at`,
      [email, passwordHash, name, role || 'customer'],
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/admin/users/:id/role — change user role
router.put('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  const validRoles = ['customer', 'manager', 'stockist', 'admin'];

  if (!role || !validRoles.includes(role)) {
    return res
      .status(400)
      .json({ error: `Role must be one of: ${validRoles.join(', ')}` });
  }

  // Prevent admin from changing their own role
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot change your own role' });
  }

  try {
    const { rows } = await pool.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role, provider, created_at',
      [role, req.params.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/admin/users/:id — delete a user
router.delete('/users/:id', async (req, res) => {
  // Prevent admin from deleting themselves
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [
      req.params.id,
    ]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/admin/stats — dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [users, products, orders, revenue] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM products'),
      pool.query('SELECT COUNT(*) FROM orders'),
      pool.query('SELECT COALESCE(SUM(total), 0) AS total FROM orders'),
    ]);

    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalProducts: parseInt(products.rows[0].count),
      totalOrders: parseInt(orders.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].total),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
