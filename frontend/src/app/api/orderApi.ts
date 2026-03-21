import { apiFetch } from './client';
import type { Order, AdminOrder, OrderDetail } from '../types';

export async function fetchMyOrders(): Promise<Order[]> {
  const res = await apiFetch('/api/orders');
  return res.json();
}

export async function fetchAllOrders(): Promise<AdminOrder[]> {
  const res = await apiFetch('/api/orders?all=true');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchOrderDetail(id: number): Promise<OrderDetail> {
  const res = await apiFetch(`/api/orders/${id}`);
  return res.json();
}

export async function createOrder(shippingAddress: string): Promise<Response> {
  return apiFetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ shipping_address: shippingAddress }),
  });
}

export async function updateOrderStatus(orderId: number, status: string): Promise<Response> {
  return apiFetch(`/api/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}
