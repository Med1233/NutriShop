import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: '1' })),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: null })),
}));

vi.mock('../../context/CartContext', () => ({
  useCart: vi.fn(() => ({ addToCart: vi.fn().mockResolvedValue({}) })),
}));

vi.mock('../../api/productApi', () => ({
  fetchProduct: vi.fn(),
}));

import { useProductDetail } from '../useProductDetail';
import { fetchProduct } from '../../api/productApi';
import { useCart } from '../../context/CartContext';

const mockProduct = {
  id: 1,
  name: 'Whey Protein',
  description: 'Great protein',
  price: '29.99',
  image_url: '',
  category: 'proteins',
  stock: 50,
  nutrition_info: { calories: '120', protein: '25g', serving_size: '30g' },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchProduct).mockResolvedValue(mockProduct);
});

describe('useProductDetail', () => {
  it('loads product on mount', async () => {
    const { result } = renderHook(() => useProductDetail());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.product?.name).toBe('Whey Protein');
    });
  });

  it('sets product to null on fetch error', async () => {
    vi.mocked(fetchProduct).mockRejectedValue(new Error('not found'));

    const { result } = renderHook(() => useProductDetail());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.product).toBeNull();
    });
  });

  it('parses nutrition entries excluding serving_size', async () => {
    const { result } = renderHook(() => useProductDetail());

    await waitFor(() => {
      expect(result.current.servingSize).toBe('30g');
      expect(result.current.nutritionEntries).toEqual([
        ['calories', '120'],
        ['protein', '25g'],
      ]);
    });
  });

  it('handleAdd calls addToCart with quantity', async () => {
    const addToCart = vi.fn().mockResolvedValue({});
    vi.mocked(useCart).mockReturnValue({ addToCart } as any);

    const { result } = renderHook(() => useProductDetail());

    await waitFor(() => expect(result.current.product).not.toBeNull());

    act(() => {
      result.current.setQuantity(3);
    });

    await act(async () => {
      await result.current.handleAdd();
    });

    expect(addToCart).toHaveBeenCalledWith(1, 3);
  });

  it('isCustomer is true when no user', async () => {
    const { result } = renderHook(() => useProductDetail());
    expect(result.current.isCustomer).toBe(true);
  });
});
