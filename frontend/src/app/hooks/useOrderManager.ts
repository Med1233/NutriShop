import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { fetchAllOrders, fetchOrderDetail, updateOrderStatus } from '../api/orderApi';
import type { AdminOrder, OrderDetail } from '../types';

export function useOrderManager() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && (!user || user.role === 'customer')) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  const load = () => {
    fetchAllOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user && user.role !== 'customer') load();
  }, [user]);

  const handleStatusChange = async (orderId: number, status: string) => {
    await updateOrderStatus(orderId, status);
    load();
  };

  const toggleDetail = async (orderId: number) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(orderId);
    const data = await fetchOrderDetail(orderId);
    setDetail(data);
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    orders, loading, expandedId, detail, filter, setFilter,
    filteredOrders, statusCounts, handleStatusChange, toggleDetail,
    authLoading, user,
  };
}
