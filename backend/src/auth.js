const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('./db');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SALT_ROUNDS = 12;

function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'customer',
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );
}

async function generateRefreshToken(userId) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt],
  );
  return { token, expiresAt };
}

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

async function revokeRefreshToken(token) {
  await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
}

async function revokeAllUserTokens(userId) {
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
}

async function findRefreshToken(token) {
  const { rows } = await pool.query(
    'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
    [token],
  );
  return rows[0] || null;
}

function setTokenCookies(res, accessToken, refreshToken) {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 min
    path: '/',
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_EXPIRY_MS,
    path: '/api/auth',
  });
}

function clearTokenCookies(res) {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/api/auth' });
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  verifyPassword,
  verifyAccessToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  findRefreshToken,
  setTokenCookies,
  clearTokenCookies,
};
