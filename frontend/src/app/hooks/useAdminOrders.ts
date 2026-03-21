import { useEffect, useState } from 'react';
import { fetchAllOrders, updateOrderStatus } from '../api/orderApi';
import type { AdminOrder } from '../types';

export function useAdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  const load = () =>
    fetchAllOrders()
      .then(setOrders)
      .catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (orderId: number, status: string) => {
    await updateOrderStatus(orderId, status);
    load();
  };

  return { orders, handleStatusChange };
}
