const supertest = require('supertest');
const { app, createTestUser, createTestProduct } = require('../helpers');

const request = supertest(app);

describe('GET /api/cart', () => {
  it('requires auth', async () => {
    const res = await request.get('/api/cart');
    expect(res.status).toBe(401);
  });

  it('returns empty cart', async () => {
    const { token } = await createTestUser();
    const res = await request.get('/api/cart').set('Cookie', `access_token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/cart', () => {
  it('adds item to cart', async () => {
    const { token } = await createTestUser();
    const product = await createTestProduct();
    const res = await request.post('/api/cart')
      .set('Cookie', `access_token=${token}`)
      .send({ product_id: product.id, quantity: 2 });
    expect(res.status).toBe(201);
    expect(res.body.quantity).toBe(2);
  });

  it('increments quantity on duplicate add', async () => {
    const { token } = await createTestUser();
    const product = await createTestProduct();
    await request.post('/api/cart')
      .set('Cookie', `access_token=${token}`)
      .send({ product_id: product.id, quantity: 1 });
    const res = await request.post('/api/cart')
      .set('Cookie', `access_token=${token}`)
      .send({ product_id: product.id, quantity: 3 });
    expect(res.status).toBe(201);
    expect(res.body.quantity).toBe(4);
  });

  it('rejects insufficient stock', async () => {
    const { token } = await createTestUser();
    const product = await createTestProduct({ stock: 5 });
    const res = await request.post('/api/cart')
      .set('Cookie', `access_token=${token}`)
      .send({ product_id: product.id, quantity: 10 });
    expect(res.status).toBe(400);
  });

  it('rejects nonexistent product', async () => {
    const { token } = await createTestUser();
    const res = await request.post('/api/cart')
      .set('Cookie', `access_token=${token}`)
      .send({ product_id: 9999, quantity: 1 });
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/cart/:id', () => {
  it('updates quantity', async () => {
    const { token } = await createTestUser();
    const product = await createTestProduct();
    const addRes = await request.post('/api/cart')
      .set('Cookie', `access_token=${token}`)
      .send({ product_id: product.id, quantity: 1 });
    const res = await request.put(`/api/cart/${addRes.body.id}`)
      .set('Cookie', `access_token=${token}`)
      .send({ quantity: 5 });
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(5);
  });

  it('rejects quantity < 1', async () => {
    const { token } = await createTestUser();
    const product = await createTestProduct();
    const addRes = await request.post('/api/cart')
      .set('Cookie', `access_token=${token}`)
      .send({ product_id: product.id, quantity: 1 });
    const res = await request.put(`/api/cart/${addRes.body.id}`)
      .set('Cookie', `access_token=${token}`)
      .send({ quantity: 0 });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/cart/:id', () => {
  it('removes item', async () => {
    const { token } = await createTestUser();
    const product = await createTestProduct();
    const addRes = await request.post('/api/cart')
      .set('Cookie', `access_token=${token}`)
      .send({ product_id: product.id, quantity: 1 });
    const res = await request.delete(`/api/cart/${addRes.body.id}`)
      .set('Cookie', `access_token=${token}`);
    expect(res.status).toBe(200);

    const cartRes = await request.get('/api/cart').set('Cookie', `access_token=${token}`);
    expect(cartRes.body).toEqual([]);
  });
});
