const supertest = require('supertest');
const { app, createTestUser, createTestProduct } = require('../helpers');

const request = supertest(app);

async function addToCartAndOrder(token, productId) {
  await request.post('/api/cart')
    .set('Cookie', `access_token=${token}`)
    .send({ product_id: productId, quantity: 2 });
  return request.post('/api/orders')
    .set('Cookie', `access_token=${token}`)
    .send({ shipping_address: '123 Test St' });
}

describe('POST /api/orders', () => {
  it('creates order from cart', async () => {
    const { token } = await createTestUser();
    const product = await createTestProduct({ stock: 100 });
    const res = await addToCartAndOrder(token, product.id);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();

    // Cart should be empty
    const cartRes = await request.get('/api/cart').set('Cookie', `access_token=${token}`);
    expect(cartRes.body).toEqual([]);

    // Stock should be decremented
    const prodRes = await request.get(`/api/products/${product.id}`);
    expect(prodRes.body.stock).toBe(98);
  });

  it('rejects empty cart', async () => {
    const { token } = await createTestUser();
    const res = await request.post('/api/orders')
      .set('Cookie', `access_token=${token}`)
      .send({ shipping_address: '123 Test St' });
    expect(res.status).toBe(400);
  });

  it('requires auth', async () => {
    const res = await request.post('/api/orders').send({ shipping_address: 'X' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/orders', () => {
  it('returns user own orders', async () => {
    const { token } = await createTestUser();
    const product = await createTestProduct();
    await addToCartAndOrder(token, product.id);
    const res = await request.get('/api/orders').set('Cookie', `access_token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('admin sees all orders with ?all=true', async () => {
    const cust = await createTestUser({ email: 'c@t.com' });
    const product = await createTestProduct();
    await addToCartAndOrder(cust.token, product.id);

    const admin = await createTestUser({ email: 'a@t.com', role: 'admin' });
    const res = await request.get('/api/orders?all=true').set('Cookie', `access_token=${admin.token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});

describe('PUT /api/orders/:id/status', () => {
  it('manager updates status', async () => {
    const cust = await createTestUser({ email: 'c@t.com' });
    const product = await createTestProduct();
    const orderRes = await addToCartAndOrder(cust.token, product.id);

    const mgr = await createTestUser({ email: 'm@t.com', role: 'manager' });
    const res = await request.put(`/api/orders/${orderRes.body.id}/status`)
      .set('Cookie', `access_token=${mgr.token}`)
      .send({ status: 'processing' });
    expect(res.status).toBe(200);
  });

  it('cancel restores stock', async () => {
    const cust = await createTestUser({ email: 'c@t.com' });
    const product = await createTestProduct({ stock: 50 });
    const orderRes = await addToCartAndOrder(cust.token, product.id);

    const mgr = await createTestUser({ email: 'm@t.com', role: 'manager' });
    await request.put(`/api/orders/${orderRes.body.id}/status`)
      .set('Cookie', `access_token=${mgr.token}`)
      .send({ status: 'cancelled' });

    const prodRes = await request.get(`/api/products/${product.id}`);
    expect(prodRes.body.stock).toBe(50); // restored
  });

  it('customer cannot update status', async () => {
    const cust = await createTestUser({ email: 'c@t.com' });
    const product = await createTestProduct();
    const orderRes = await addToCartAndOrder(cust.token, product.id);

    const res = await request.put(`/api/orders/${orderRes.body.id}/status`)
      .set('Cookie', `access_token=${cust.token}`)
      .send({ status: 'processing' });
    expect(res.status).toBe(403);
  });
});
