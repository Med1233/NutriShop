import { apiFetch } from './client';
import type { AdminStats, AdminUser } from '../types';

export async function fetchStats(): Promise<AdminStats> {
  const res = await apiFetch('/api/admin/stats');
  return res.json();
}

export async function fetchUsers(): Promise<AdminUser[]> {
  const res = await apiFetch('/api/admin/users');
  return res.json();
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<Response> {
  return apiFetch('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUserRole(
  userId: number,
  role: string,
): Promise<Response> {
  return apiFetch(`/api/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export async function deleteUser(userId: number): Promise<Response> {
  return apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
}
