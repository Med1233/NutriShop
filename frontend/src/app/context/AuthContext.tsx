'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { apiFetch } from '../api/client';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
  updateProfile: (data: {
    name?: string;
    phone?: string;
    address?: string;
  }) => Promise<{ error?: string }>;
  resendVerification: () => Promise<{ error?: string; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/auth/refresh', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await apiFetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else if (res.status === 401) {
        const refreshed = await refresh();
        if (!refreshed) {
          setUser(null);
        }
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      return {};
    }
    return { error: data.error };
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      return {};
    }
    return { error: data.error };
  };

  const logout = async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const updateProfile = async (data: {
    name?: string;
    phone?: string;
    address?: string;
  }) => {
    const res = await apiFetch('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      setUser(result.user);
      return {};
    }
    return { error: result.error };
  };

  const resendVerification = async () => {
    const res = await apiFetch('/api/auth/resend-verification', {
      method: 'POST',
    });
    const data = await res.json();
    if (res.ok) return { message: data.message };
    return { error: data.error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refresh,
        updateProfile,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
