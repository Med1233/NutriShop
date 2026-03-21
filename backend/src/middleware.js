const { verifyAccessToken } = require('./auth');

/**
 * Authentication middleware.
 * Extracts JWT from the access_token cookie, verifies it,
 * and attaches the user to req.user.
 */
function requireAuth(req, res, next) {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Optional auth — attaches user if token is present, but doesn't block.
 */
function optionalAuth(req, res, next) {
  const token = req.cookies?.access_token;
  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // ignore invalid tokens for optional auth
    }
  }
  next();
}

/**
 * Admin-only middleware. Must be used after requireAuth.
 * Checks that the authenticated user has the 'admin' role.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

/**
 * Staff middleware — allows admin or manager. Must be used after requireAuth.
 */
function requireStaff(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
    return res.status(403).json({ error: 'Staff access required' });
  }
  next();
}

/**
 * Product manager middleware — allows admin or stockist. Must be used after requireAuth.
 */
function requireProductManager(req, res, next) {
  if (
    !req.user ||
    (req.user.role !== 'admin' && req.user.role !== 'stockist')
  ) {
    return res
      .status(403)
      .json({ error: 'Product management access required' });
  }
  next();
}

module.exports = {
  requireAuth,
  optionalAuth,
  requireAdmin,
  requireStaff,
  requireProductManager,
};
