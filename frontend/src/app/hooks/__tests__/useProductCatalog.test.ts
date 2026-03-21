import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock dependencies
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: null })),
}));

vi.mock('../../context/CartContext', () => ({
  useCart: vi.fn(() => ({ addToCart: vi.fn().mockResolvedValue({}) })),
}));

vi.mock('../../api/productApi', () => ({
  fetchCategories: vi.fn().mockResolvedValue(['proteins', 'vitamins']),
  fetchProducts: vi.fn().mockResolvedValue([
    { id: 1, name: 'Whey', price: '29.99', category: 'proteins', stock: 100 },
  ]),
}));

import { useProductCatalog } from '../useProductCatalog';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { fetchCategories, fetchProducts } from '../../api/productApi';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAuth).mockReturnValue({ user: null } as any);
  vi.mocked(useCart).mockReturnValue({ addToCart: vi.fn().mockResolvedValue({}) } as any);
  vi.mocked(fetchCategories).mockResolvedValue(['proteins', 'vitamins']);
  vi.mocked(fetchProducts).mockResolvedValue([
    { id: 1, name: 'Whey', price: '29.99', category: 'proteins', stock: 100, description: '', image_url: '', nutrition_info: {} },
  ]);
});

describe('useProductCatalog', () => {
  it('loads categories and products on mount', async () => {
    const { result } = renderHook(() => useProductCatalog());

    await waitFor(() => {
      expect(result.current.categories).toEqual(['proteins', 'vitamins']);
      expect(result.current.products).toHaveLength(1);
    });
  });

  it('isCustomer is true when no user', () => {
    const { result } = renderHook(() => useProductCatalog());
    expect(result.current.isCustomer).toBe(true);
  });

  it('isCustomer is false for admin', () => {
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'admin' } } as any);
    const { result } = renderHook(() => useProductCatalog());
    expect(result.current.isCustomer).toBe(false);
  });

  it('updates search state', async () => {
    const { result } = renderHook(() => useProductCatalog());

    act(() => {
      result.current.setSearch('whey');
    });

    expect(result.current.search).toBe('whey');
  });

  it('updates active category', async () => {
    const { result } = renderHook(() => useProductCatalog());

    act(() => {
      result.current.setActiveCategory('proteins');
    });

    expect(result.current.activeCategory).toBe('proteins');
  });

  it('handleAddToCart calls addToCart and sets addedId', async () => {
    const addToCart = vi.fn().mockResolvedValue({});
    vi.mocked(useCart).mockReturnValue({ addToCart } as any);

    const { result } = renderHook(() => useProductCatalog());

    await act(async () => {
      await result.current.handleAddToCart(1);
    });

    expect(addToCart).toHaveBeenCalledWith(1);
    expect(result.current.addedId).toBe(1);
  });
});
