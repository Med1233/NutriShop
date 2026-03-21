import { apiFetch, getBackendUrl } from './client';
import type { Product } from '../types';

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${getBackendUrl()}/api/products/categories`);
  return res.json();
}

export async function fetchProducts(params?: { category?: string; search?: string }): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  const res = await fetch(`${getBackendUrl()}/api/products?${query}`);
  return res.json();
}

export async function fetchProduct(id: string | number): Promise<Product> {
  const res = await fetch(`${getBackendUrl()}/api/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function createProduct(data: { name: string; description: string; price: number; category: string; stock: number }) {
  return apiFetch('/api/products', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateProduct(id: number, data: { name: string; description: string; price: number; category: string; stock: number }) {
  return apiFetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteProduct(id: number) {
  return apiFetch(`/api/products/${id}`, { method: 'DELETE' });
}
