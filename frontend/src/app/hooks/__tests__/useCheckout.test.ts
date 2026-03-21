import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: { id: 1, name: 'Test' }, loading: false })),
}));

vi.mock('../../context/CartContext', () => ({
  useCart: vi.fn(() => ({
    items: [
      { id: 1, name: 'Whey', price: '29.99', quantity: 2 },
    ],
    loading: false,
    refresh: vi.fn(),
  })),
}));

vi.mock('../../api/orderApi', () => ({
  createOrder: vi.fn(),
}));

import { useCheckout } from '../useCheckout';
import { createOrder } from '../../api/orderApi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAuth).mockReturnValue({ user: { id: 1, name: 'Test' }, loading: false } as any);
  vi.mocked(useCart).mockReturnValue({
    items: [{ id: 1, name: 'Whey', price: '29.99', quantity: 2 }],
    loading: false,
    refresh: vi.fn(),
  } as any);
});

describe('useCheckout', () => {
  it('calculates subtotal from cart items', () => {
    const { result } = renderHook(() => useCheckout());
    expect(result.current.subtotal).toBeCloseTo(59.98);
  });

  it('updates address', () => {
    const { result } = renderHook(() => useCheckout());
    act(() => { result.current.setAddress('123 Main St'); });
    expect(result.current.address).toBe('123 Main St');
  });

  it('handleSubmit creates order on success', async () => {
    vi.mocked(createOrder).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 42 }),
    } as Response);

    const { result } = renderHook(() => useCheckout());

    act(() => { result.current.setAddress('456 Oak Ave'); });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(createOrder).toHaveBeenCalledWith('456 Oak Ave');
    expect(result.current.orderId).toBe(42);
    expect(result.current.submitting).toBe(false);
  });

  it('handleSubmit sets error on failure', async () => {
    vi.mocked(createOrder).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Cart empty' }),
    } as Response);

    const { result } = renderHook(() => useCheckout());

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.error).toBe('Cart empty');
    expect(result.current.orderId).toBeNull();
  });

  it('handleSubmit handles network error', async () => {
    vi.mocked(createOrder).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCheckout());

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.error).toBe('Something went wrong');
  });

  it('exposes user and loading state', () => {
    const { result } = renderHook(() => useCheckout());
    expect(result.current.user).toBeDefined();
    expect(result.current.authLoading).toBe(false);
    expect(result.current.loading).toBe(false);
  });
});
