// Per-file setup — reset data between tests (integration)
const { pool } = require('../src/db');

beforeEach(async () => {
  try {
    await pool.query('DELETE FROM order_items');
    await pool.query('DELETE FROM cart_items');
    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM refresh_tokens');
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM products');
    await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE products_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE orders_id_seq RESTART WITH 1');
  } catch {
    // Ignore if tables don't exist (unit tests)
  }
});
