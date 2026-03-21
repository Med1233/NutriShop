import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { fetchStats } from '../api/adminApi';
import type { AdminStats } from '../types';

type Tab = 'products' | 'users' | 'orders';

export function useAdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('products');
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats().then(setStats).catch(() => {});
    }
  }, [user]);

  return { tab, setTab, stats, user, authLoading };
}
