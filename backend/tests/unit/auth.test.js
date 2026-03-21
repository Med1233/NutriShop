const jwt = require('jsonwebtoken');
const {
  generateAccessToken,
  verifyAccessToken,
  hashPassword,
  verifyPassword,
  setTokenCookies,
  clearTokenCookies,
} = require('../../src/auth');

describe('generateAccessToken', () => {
  it('returns a valid JWT', () => {
    const token = generateAccessToken({ id: 1, email: 'a@b.com', name: 'A', role: 'customer' });
    expect(typeof token).toBe('string');
    const decoded = jwt.decode(token);
    expect(decoded.id).toBe(1);
    expect(decoded.email).toBe('a@b.com');
    expect(decoded.role).toBe('customer');
  });

  it('defaults role to customer', () => {
    const token = generateAccessToken({ id: 1, email: 'a@b.com', name: 'A' });
    const decoded = jwt.decode(token);
    expect(decoded.role).toBe('customer');
  });

  it('sets expiry', () => {
    const token = generateAccessToken({ id: 1, email: 'a@b.com', name: 'A', role: 'admin' });
    const decoded = jwt.decode(token);
    expect(decoded.exp).toBeDefined();
    expect(decoded.exp - decoded.iat).toBe(15 * 60);
  });
});

describe('verifyAccessToken', () => {
  it('verifies a valid token', () => {
    const token = generateAccessToken({ id: 2, email: 'x@y.com', name: 'X', role: 'admin' });
    const payload = verifyAccessToken(token);
    expect(payload.id).toBe(2);
    expect(payload.role).toBe('admin');
  });

  it('throws for an invalid token', () => {
    expect(() => verifyAccessToken('garbage')).toThrow();
  });

  it('throws for a tampered token', () => {
    const token = generateAccessToken({ id: 1, email: 'a@b.com', name: 'A', role: 'customer' });
    expect(() => verifyAccessToken(token + 'x')).toThrow();
  });
});

describe('hashPassword / verifyPassword', () => {
  it('hashes and verifies correctly', async () => {
    const hash = await hashPassword('secret');
    expect(hash).not.toBe('secret');
    expect(await verifyPassword('secret', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });

  it('produces unique hashes (salted)', async () => {
    const h1 = await hashPassword('same');
    const h2 = await hashPassword('same');
    expect(h1).not.toBe(h2);
  });
});

describe('setTokenCookies', () => {
  it('sets both cookies with correct options', () => {
    const cookies = {};
    const res = {
      cookie: (name, val, opts) => { cookies[name] = { val, opts }; },
    };
    setTokenCookies(res, 'acc', 'ref', new Date());
    expect(cookies.access_token).toBeDefined();
    expect(cookies.access_token.opts.httpOnly).toBe(true);
    expect(cookies.access_token.opts.path).toBe('/');
    expect(cookies.refresh_token).toBeDefined();
    expect(cookies.refresh_token.opts.path).toBe('/api/auth');
  });

  it('sets secure=false in non-production', () => {
    const cookies = {};
    const res = { cookie: (name, val, opts) => { cookies[name] = { val, opts }; } };
    setTokenCookies(res, 'a', 'r', new Date());
    expect(cookies.access_token.opts.secure).toBe(false);
  });
});

describe('clearTokenCookies', () => {
  it('clears both cookies', () => {
    const cleared = [];
    const res = { clearCookie: (name, opts) => cleared.push({ name, opts }) };
    clearTokenCookies(res);
    expect(cleared).toHaveLength(2);
    expect(cleared.map(c => c.name)).toEqual(['access_token', 'refresh_token']);
  });
});
