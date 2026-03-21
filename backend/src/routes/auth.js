const express = require('express');
const {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  setTokenCookies,
  clearTokenCookies,
} = require('../auth');
const { pool } = require('../db');
const { requireAuth } = require('../middleware');

const router = express.Router();

// ─── Register (local) ───────────────────────────────────────────────

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

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

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name, provider)
       VALUES ($1, $2, $3, 'local') RETURNING id, email, name, role, provider, created_at`,
      [email, passwordHash, name],
    );

    const user = rows[0];
    const accessToken = generateAccessToken(user);
    const { token: refreshToken, expiresAt } = await generateRefreshToken(
      user.id,
    );

    setTokenCookies(res, accessToken, refreshToken, expiresAt);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'customer',
        provider: user.provider,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Login (local) ──────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { rows } = await pool.query(
      'SELECT id, email, name, role, password_hash, provider FROM users WHERE email = $1',
      [email],
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];

    if (user.provider !== 'local') {
      return res.status(401).json({
        error: `This account uses ${user.provider} sign-in. Please use that method instead.`,
      });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const { token: refreshToken, expiresAt } = await generateRefreshToken(
      user.id,
    );

    setTokenCookies(res, accessToken, refreshToken, expiresAt);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'customer',
        provider: user.provider,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Refresh token ──────────────────────────────────────────────────

router.post('/refresh', async (req, res) => {
  try {
    const oldToken = req.cookies?.refresh_token;

    if (!oldToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const stored = await findRefreshToken(oldToken);
    if (!stored) {
      return res
        .status(401)
        .json({ error: 'Invalid or expired refresh token' });
    }

    // Rotate: revoke old, issue new
    await revokeRefreshToken(oldToken);

    const { rows } = await pool.query(
      'SELECT id, email, name, role, provider FROM users WHERE id = $1',
      [stored.user_id],
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = rows[0];
    const accessToken = generateAccessToken(user);
    const { token: refreshToken, expiresAt } = await generateRefreshToken(
      user.id,
    );

    setTokenCookies(res, accessToken, refreshToken, expiresAt);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'customer',
        provider: user.provider,
      },
    });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Logout ─────────────────────────────────────────────────────────

router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    clearTokenCookies(res);
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Logout all sessions ────────────────────────────────────────────

router.post('/logout-all', requireAuth, async (req, res) => {
  try {
    await revokeAllUserTokens(req.user.id);
    clearTokenCookies(res);
    res.json({ message: 'All sessions revoked' });
  } catch (err) {
    console.error('Logout-all error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Get current user ───────────────────────────────────────────────

router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, role, phone, address, provider, created_at FROM users WHERE id = $1',
      [req.user.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Update profile ────────────────────────────────────────────────

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    if (name !== undefined && (!name || name.trim().length === 0)) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    const { rows } = await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        address = COALESCE($3, address),
        updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, name, role, phone, address, provider, created_at`,
      [
        name || null,
        phone !== undefined ? phone : null,
        address !== undefined ? address : null,
        req.user.id,
      ],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Google OAuth: Redirect to Google ───────────────────────────────

router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || clientId === 'your-google-client-id') {
    return res.status(501).json({ error: 'Google OAuth is not configured' });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// ─── Google OAuth: Callback ─────────────────────────────────────────

router.get('/google/callback', async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${frontendUrl}/login?error=no_code`);
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error('Google token error:', tokenData);
      return res.redirect(`${frontendUrl}/login?error=token_exchange_failed`);
    }

    // Get user info
    const userInfoRes = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      },
    );

    const profile = await userInfoRes.json();

    if (!profile.email) {
      return res.redirect(`${frontendUrl}/login?error=no_email`);
    }

    // Find or create user
    let user;
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [
      profile.email,
    ]);

    if (existing.rows.length > 0) {
      user = existing.rows[0];
      // If user exists with local provider, link the Google account
      if (user.provider === 'local') {
        await pool.query(
          'UPDATE users SET provider = $1, provider_id = $2, updated_at = NOW() WHERE id = $3',
          ['google', profile.id, user.id],
        );
        user.provider = 'google';
      }
    } else {
      const { rows } = await pool.query(
        `INSERT INTO users (email, name, provider, provider_id)
         VALUES ($1, $2, 'google', $3)
         RETURNING id, email, name, role, provider, created_at`,
        [profile.email, profile.name || profile.email, profile.id],
      );
      user = rows[0];
    }

    const accessToken = generateAccessToken(user);
    const { token: refreshToken, expiresAt } = await generateRefreshToken(
      user.id,
    );

    setTokenCookies(res, accessToken, refreshToken, expiresAt);

    res.redirect(`${frontendUrl}/`);
  } catch (err) {
    console.error('Google callback error:', err);
    res.redirect(`${frontendUrl}/login?error=server_error`);
  }
});

module.exports = router;
