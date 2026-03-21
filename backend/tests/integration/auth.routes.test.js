const supertest = require('supertest');
const { app, createTestUser } = require('../helpers');

const request = supertest(app);

describe('POST /api/auth/register', () => {
  it('registers a new user', async () => {
    const res = await request.post('/api/auth/register').send({
      email: 'new@test.com',
      password: 'password123',
      name: 'New User',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('new@test.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects duplicate email', async () => {
    await createTestUser({ email: 'dup@test.com' });
    const res = await request
      .post('/api/auth/register')
      .send({ email: 'dup@test.com', password: 'password123', name: 'Dup' });
    expect(res.status).toBe(409);
  });

  it('rejects missing fields', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ email: 'x@y.com' });
    expect(res.status).toBe(400);
  });

  it('rejects short password', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ email: 'x@y.com', password: '123', name: 'X' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with valid credentials', async () => {
    await createTestUser({ email: 'login@test.com', password: 'pass1234' });
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'pass1234' });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('login@test.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects wrong password', async () => {
    await createTestUser({ email: 'login@test.com', password: 'correct' });
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('rejects nonexistent email', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'nope@test.com', password: 'anything' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns user with valid token', async () => {
    const { token } = await createTestUser({ email: 'me@test.com' });
    const res = await request
      .get('/api/auth/me')
      .set('Cookie', `access_token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('me@test.com');
  });

  it('returns 401 without token', async () => {
    const res = await request.get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('clears cookies', async () => {
    const { token } = await createTestUser();
    const res = await request
      .post('/api/auth/logout')
      .set('Cookie', `access_token=${token}`);
    expect(res.status).toBe(200);
  });
});

describe('PUT /api/auth/profile', () => {
  it('updates user profile', async () => {
    const { token } = await createTestUser();
    const res = await request
      .put('/api/auth/profile')
      .set('Cookie', `access_token=${token}`)
      .send({ name: 'Updated', phone: '555-1234' });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Updated');
    expect(res.body.user.phone).toBe('555-1234');
  });
});
