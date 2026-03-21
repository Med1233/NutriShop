import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchCategories, fetchProducts, fetchProduct } from '../productApi';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('fetchCategories', () => {
  it('returns categories array', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve(['proteins', 'vitamins']),
    }));

    const result = await fetchCategories();
    expect(result).toEqual(['proteins', 'vitamins']);
  });
});

describe('fetchProducts', () => {
  it('calls with no params', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal('fetch', mockFetch);

    await fetchProducts();
    expect(mockFetch.mock.calls[0][0]).toContain('/api/products?');
  });

  it('passes category and search params', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal('fetch', mockFetch);

    await fetchProducts({ category: 'proteins', search: 'whey' });
    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('category=proteins');
    expect(url).toContain('search=whey');
  });
});

describe('fetchProduct', () => {
  it('returns a product', async () => {
    const product = { id: 1, name: 'Test' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(product),
    }));

    const result = await fetchProduct(1);
    expect(result).toEqual(product);
  });

  it('throws on not found', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
    }));

    await expect(fetchProduct(999)).rejects.toThrow('Product not found');
  });
});
