const supertest = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/db');
const { hashPassword, generateAccessToken } = require('../src/auth');

async function resetDb() {
  await pool.query(
    'TRUNCATE users, refresh_tokens, verification_tokens, products, cart_items, orders, order_items RESTART IDENTITY CASCADE',
  );
}

async function createTestUser(overrides = {}) {
  const data = {
    email: 'test@test.com',
    name: 'Test User',
    password: 'password123',
    role: 'customer',
    email_verified: true,
    ...overrides,
  };
  const hash = await hashPassword(data.password);
  const { rows } = await pool.query(
    'INSERT INTO users (email, name, password_hash, role, provider, email_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [data.email, data.name, hash, data.role, 'local', data.email_verified],
  );
  const user = rows[0];
  const token = generateAccessToken(user);
  return { user, token, rawPassword: data.password };
}

async function createTestProduct(overrides = {}) {
  const data = {
    name: 'Test Product',
    description: 'A test product',
    price: 29.99,
    category: 'proteins',
    stock: 100,
    ...overrides,
  };
  const { rows } = await pool.query(
    'INSERT INTO products (name, description, price, category, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [data.name, data.description, data.price, data.category, data.stock],
  );
  return rows[0];
}

function authAgent(token) {
  const agent = supertest.agent(app);
  agent.set('Cookie', `access_token=${token}`);
  return agent;
}

module.exports = { resetDb, createTestUser, createTestProduct, authAgent, app };
