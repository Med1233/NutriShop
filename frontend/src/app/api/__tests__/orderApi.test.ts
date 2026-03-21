import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the client module before importing orderApi
vi.mock('../client', () => ({
  apiFetch: vi.fn(),
  getBackendUrl: () => 'http://localhost:4000',
}));

import {
  fetchMyOrders,
  fetchAllOrders,
  createOrder,
  updateOrderStatus,
} from '../orderApi';
import { apiFetch } from '../client';

const mockApiFetch = vi.mocked(apiFetch);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchMyOrders', () => {
  it('calls /api/orders and returns data', async () => {
    const orders = [{ id: 1, total: '29.99', status: 'pending' }];
    mockApiFetch.mockResolvedValue({
      json: () => Promise.resolve(orders),
    } as Response);

    const result = await fetchMyOrders();
    expect(mockApiFetch).toHaveBeenCalledWith('/api/orders');
    expect(result).toEqual(orders);
  });
});

describe('fetchAllOrders', () => {
  it('calls with ?all=true and returns array', async () => {
    mockApiFetch.mockResolvedValue({
      json: () => Promise.resolve([{ id: 1 }]),
    } as Response);

    const result = await fetchAllOrders();
    expect(mockApiFetch).toHaveBeenCalledWith('/api/orders?all=true');
    expect(result).toHaveLength(1);
  });

  it('returns empty array if response is not array', async () => {
    mockApiFetch.mockResolvedValue({
      json: () => Promise.resolve({ error: 'fail' }),
    } as Response);

    const result = await fetchAllOrders();
    expect(result).toEqual([]);
  });
});

describe('createOrder', () => {
  it('sends shipping address', async () => {
    mockApiFetch.mockResolvedValue({ ok: true } as Response);

    await createOrder('123 Main St');
    expect(mockApiFetch).toHaveBeenCalledWith('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ shipping_address: '123 Main St' }),
    });
  });
});

describe('updateOrderStatus', () => {
  it('sends PUT with status', async () => {
    mockApiFetch.mockResolvedValue({ ok: true } as Response);

    await updateOrderStatus(5, 'shipped');
    expect(mockApiFetch).toHaveBeenCalledWith('/api/orders/5/status', {
      method: 'PUT',
      body: JSON.stringify({ status: 'shipped' }),
    });
  });
});
