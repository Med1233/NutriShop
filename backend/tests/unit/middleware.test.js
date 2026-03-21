const { generateAccessToken } = require('../../src/auth');
const { requireAuth, optionalAuth, requireAdmin, requireStaff, requireProductManager } = require('../../src/middleware');

function mockReq(cookies = {}, user = undefined) {
  return { cookies, user };
}

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('requireAuth', () => {
  it('returns 401 when no token', () => {
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for invalid token', () => {
    const req = mockReq({ access_token: 'bad' });
    const res = mockRes();
    const next = vi.fn();
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next and sets req.user for valid token', () => {
    const token = generateAccessToken({ id: 1, email: 'a@b.com', name: 'A', role: 'customer' });
    const req = mockReq({ access_token: token });
    const res = mockRes();
    const next = vi.fn();
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(1);
  });
});

describe('optionalAuth', () => {
  it('calls next without token', () => {
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();
    optionalAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it('sets user with valid token', () => {
    const token = generateAccessToken({ id: 5, email: 'x@y.com', name: 'X', role: 'admin' });
    const req = mockReq({ access_token: token });
    const res = mockRes();
    const next = vi.fn();
    optionalAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(5);
  });

  it('calls next even with invalid token', () => {
    const req = mockReq({ access_token: 'garbage' });
    const res = mockRes();
    const next = vi.fn();
    optionalAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });
});

describe('requireAdmin', () => {
  it('returns 403 for non-admin', () => {
    const req = mockReq({}, { role: 'customer' });
    const res = mockRes();
    const next = vi.fn();
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('calls next for admin', () => {
    const req = mockReq({}, { role: 'admin' });
    const res = mockRes();
    const next = vi.fn();
    requireAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('requireStaff', () => {
  it('allows admin', () => {
    const req = mockReq({}, { role: 'admin' });
    const res = mockRes();
    const next = vi.fn();
    requireStaff(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('allows manager', () => {
    const req = mockReq({}, { role: 'manager' });
    const res = mockRes();
    const next = vi.fn();
    requireStaff(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('rejects customer', () => {
    const req = mockReq({}, { role: 'customer' });
    const res = mockRes();
    const next = vi.fn();
    requireStaff(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('requireProductManager', () => {
  it('allows admin', () => {
    const req = mockReq({}, { role: 'admin' });
    const res = mockRes();
    const next = vi.fn();
    requireProductManager(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('allows stockist', () => {
    const req = mockReq({}, { role: 'stockist' });
    const res = mockRes();
    const next = vi.fn();
    requireProductManager(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('rejects manager', () => {
    const req = mockReq({}, { role: 'manager' });
    const res = mockRes();
    const next = vi.fn();
    requireProductManager(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
