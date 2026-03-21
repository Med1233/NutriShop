const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://admin:password@localhost:5433/appdb_test';

module.exports = async function setup() {
  // Initialize the test DB schema
  const pool = new Pool({ connectionString: DATABASE_URL });

  const bcrypt = require('bcryptjs');

  // Create tables
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT,
    name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'customer',
    phone TEXT DEFAULT '', address TEXT DEFAULT '',
    provider TEXT NOT NULL DEFAULT 'local', provider_id TEXT,
    created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL, expires_at TIMESTAMP NOT NULL, created_at TIMESTAMP DEFAULT NOW()
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT,
    price NUMERIC(10,2) NOT NULL, image_url TEXT, category TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0, nutrition_info JSONB, created_at TIMESTAMP DEFAULT NOW()
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1, created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total NUMERIC(10,2) NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
    shipping_address TEXT, created_at TIMESTAMP DEFAULT NOW()
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL, price NUMERIC(10,2) NOT NULL
  )`);
  await pool.query(`DO $$ BEGIN
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP;
  EXCEPTION WHEN others THEN NULL; END $$`);

  await pool.end();
};
