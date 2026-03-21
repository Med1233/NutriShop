const supertest = require('supertest');
const { app, createTestUser } = require('../helpers');

const request = supertest(app);

describe('GET /api/admin/users', () => {
  it('admin lists users', async () => {
    const { token } = await createTestUser({ email: 'admin@test.com', role: 'admin' });
    await createTestUser({ email: 'other@test.com' });
    const res = await request.get('/api/admin/users').set('Cookie', `access_token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('non-admin gets 403', async () => {
    const { token } = await createTestUser({ email: 'cust@test.com', role: 'customer' });
    const res = await request.get('/api/admin/users').set('Cookie', `access_token=${token}`);
    expect(res.status).toBe(403);
  });
});

describe('POST /api/admin/users', () => {
  it('admin creates user', async () => {
    const { token } = await createTestUser({ email: 'admin@test.com', role: 'admin' });
    const res = await request.post('/api/admin/users')
      .set('Cookie', `access_token=${token}`)
      .send({ name: 'New Mgr', email: 'mgr@test.com', password: 'pass1234', role: 'manager' });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe('manager');
  });
});

describe('PUT /api/admin/users/:id/role', () => {
  it('changes user role', async () => {
    const admin = await createTestUser({ email: 'admin@test.com', role: 'admin' });
    const user = await createTestUser({ email: 'target@test.com', role: 'customer' });
    const res = await request.put(`/api/admin/users/${user.user.id}/role`)
      .set('Cookie', `access_token=${admin.token}`)
      .send({ role: 'stockist' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/admin/users/:id', () => {
  it('deletes a user', async () => {
    const admin = await createTestUser({ email: 'admin@test.com', role: 'admin' });
    const user = await createTestUser({ email: 'delete@test.com' });
    const res = await request.delete(`/api/admin/users/${user.user.id}`)
      .set('Cookie', `access_token=${admin.token}`);
    expect(res.status).toBe(200);
  });
});

describe('GET /api/admin/stats', () => {
  it('returns stats', async () => {
    const { token } = await createTestUser({ email: 'admin@test.com', role: 'admin' });
    const res = await request.get('/api/admin/stats').set('Cookie', `access_token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalUsers');
    expect(res.body).toHaveProperty('totalProducts');
    expect(res.body).toHaveProperty('totalOrders');
    expect(res.body).toHaveProperty('totalRevenue');
  });
});
