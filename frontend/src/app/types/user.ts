export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  phone: string;
  address: string;
  provider: string;
  email_verified: boolean;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  provider: string;
  created_at: string;
}

export type UserRole = 'customer' | 'manager' | 'stockist' | 'admin';
