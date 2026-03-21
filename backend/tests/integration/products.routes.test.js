const supertest = require('supertest');
const { app, createTestUser, createTestProduct } = require('../helpers');

const request = supertest(app);

describe('GET /api/products', () => {
  it('returns products list', async () => {
    await createTestProduct({ name: 'Whey' });
    await createTestProduct({ name: 'Creatine', category: 'supplements' });
    const res = await request.get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('filters by category', async () => {
    await createTestProduct({ name: 'A', category: 'proteins' });
    await createTestProduct({ name: 'B', category: 'vitamins' });
    const res = await request.get('/api/products?category=proteins');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('A');
  });

  it('searches by name', async () => {
    await createTestProduct({ name: 'Whey Protein' });
    await createTestProduct({ name: 'Multivitamin' });
    const res = await request.get('/api/products?search=whey');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('GET /api/products/:id', () => {
  it('returns single product', async () => {
    const p = await createTestProduct({ name: 'Single' });
    const res = await request.get(`/api/products/${p.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Single');
  });

  it('returns 404 for missing product', async () => {
    const res = await request.get('/api/products/9999');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/products', () => {
  it('creates product as stockist', async () => {
    const { token } = await createTestUser({ email: 'stock@test.com', role: 'stockist' });
    const res = await request.post('/api/products')
      .set('Cookie', `access_token=${token}`)
      .send({ name: 'New', description: 'Desc', price: 10, category: 'proteins', stock: 50 });
    expect(res.status).toBe(201);
  });

  it('rejects customer', async () => {
    const { token } = await createTestUser({ email: 'cust@test.com', role: 'customer' });
    const res = await request.post('/api/products')
      .set('Cookie', `access_token=${token}`)
      .send({ name: 'New', description: 'D', price: 10, category: 'proteins', stock: 50 });
    expect(res.status).toBe(403);
  });

  it('rejects without auth', async () => {
    const res = await request.post('/api/products')
      .send({ name: 'New', description: 'D', price: 10, category: 'proteins', stock: 50 });
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/products/:id', () => {
  it('updates product as admin', async () => {
    const { token } = await createTestUser({ email: 'admin@test.com', role: 'admin' });
    const p = await createTestProduct();
    const res = await request.put(`/api/products/${p.id}`)
      .set('Cookie', `access_token=${token}`)
      .send({ name: 'Updated', description: 'D', price: 20, category: 'vitamins', stock: 200 });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated');
  });
});

describe('DELETE /api/products/:id', () => {
  it('deletes product as admin', async () => {
    const { token } = await createTestUser({ email: 'admin@test.com', role: 'admin' });
    const p = await createTestProduct();
    const res = await request.delete(`/api/products/${p.id}`)
      .set('Cookie', `access_token=${token}`);
    expect(res.status).toBe(200);
  });
});
