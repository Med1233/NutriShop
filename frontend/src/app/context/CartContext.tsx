'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { apiFetch, getBackendUrl } from '../api/client';
import type { CartItem, GuestCartEntry } from '../types';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  itemCount: number;
  addToCart: (
    productId: number,
    quantity?: number,
  ) => Promise<{ error?: string }>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'nutrishop_guest_cart';

function getGuestCart(): GuestCartEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveGuestCart(entries: GuestCartEntry[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(entries));
}

function clearGuestCart() {
  localStorage.removeItem(GUEST_CART_KEY);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const prevUserRef = useRef<number | null>(null);

  const loadGuestCart = useCallback(async () => {
    const entries = getGuestCart();
    if (entries.length === 0) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${getBackendUrl()}/api/products`);
      if (!res.ok) return;
      const products = await res.json();
      const cartItems: CartItem[] = [];
      for (const entry of entries) {
        const product = products.find(
          (p: { id: number }) => p.id === entry.product_id,
        );
        if (product) {
          cartItems.push({
            id: -entry.product_id,
            product_id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            category: product.category,
            quantity: entry.quantity,
            stock: product.stock,
          });
        }
      }
      setItems(cartItems);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAuthCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getBackendUrl()}/api/cart?_t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        setItems(await res.json());
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const mergeGuestCart = useCallback(async () => {
    const entries = getGuestCart();
    if (entries.length === 0) return;
    for (const entry of entries) {
      await apiFetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({
          product_id: entry.product_id,
          quantity: entry.quantity,
        }),
      });
    }
    clearGuestCart();
  }, []);

  const refresh = useCallback(async () => {
    if (user) {
      await loadAuthCart();
    } else {
      await loadGuestCart();
    }
  }, [user, loadAuthCart, loadGuestCart]);

  useEffect(() => {
    const prevUserId = prevUserRef.current;
    const currentUserId = user?.id ?? null;

    if (currentUserId && !prevUserId) {
      (async () => {
        await mergeGuestCart();
        await loadAuthCart();
      })();
    } else if (!currentUserId && prevUserId) {
      loadGuestCart();
    } else {
      refresh();
    }

    prevUserRef.current = currentUserId;
  }, [user, mergeGuestCart, loadAuthCart, loadGuestCart, refresh]);

  const addToCart = async (productId: number, quantity = 1) => {
    if (user) {
      const res = await apiFetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      if (res.ok) {
        await loadAuthCart();
        return {};
      }
      const data = await res.json();
      return { error: data.error };
    } else {
      const entries = getGuestCart();
      const existing = entries.find((e) => e.product_id === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        entries.push({ product_id: productId, quantity });
      }
      saveGuestCart(entries);
      await loadGuestCart();
      return {};
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (user) {
      await apiFetch(`/api/cart/${cartItemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      await loadAuthCart();
    } else {
      const productId = -cartItemId;
      const entries = getGuestCart();
      const entry = entries.find((e) => e.product_id === productId);
      if (entry) {
        entry.quantity = quantity;
        saveGuestCart(entries);
        await loadGuestCart();
      }
    }
  };

  const removeItem = async (cartItemId: number) => {
    if (user) {
      await apiFetch(`/api/cart/${cartItemId}`, { method: 'DELETE' });
      await loadAuthCart();
    } else {
      const productId = -cartItemId;
      const entries = getGuestCart().filter((e) => e.product_id !== productId);
      saveGuestCart(entries);
      await loadGuestCart();
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        itemCount,
        addToCart,
        updateQuantity,
        removeItem,
        refresh,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
