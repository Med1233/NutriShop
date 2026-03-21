import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { fetchMyOrders, fetchOrderDetail } from '../api/orderApi';
import type { Order, OrderDetail } from '../types';

type Tab = 'info' | 'orders';

export function useProfile() {
  const { user, loading: authLoading, updateProfile } = useAuth();
  const router = useRouter();

  const isCustomer = user?.role === 'customer';

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [tab, setTab] = useState<Tab>('info');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user || !isCustomer) return;
    fetchMyOrders()
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setOrdersLoaded(true));
  }, [user, isCustomer]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    const result = await updateProfile(form);
    setSaving(false);
    if (result.error) {
      setSaveMsg(result.error);
    } else {
      setEditing(false);
      setSaveMsg('saved');
      setTimeout(() => setSaveMsg(''), 2000);
    }
  };

  const handleCancel = () => {
    if (user)
      setForm({
        name: user.name,
        phone: user.phone || '',
        address: user.address || '',
      });
    setEditing(false);
    setSaveMsg('');
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

  const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.total), 0);

  return {
    user,
    authLoading,
    isCustomer,
    editing,
    setEditing,
    form,
    setForm,
    saving,
    saveMsg,
    tab,
    setTab,
    orders,
    ordersLoaded,
    expandedId,
    detail,
    handleSave,
    handleCancel,
    toggleDetail,
    totalSpent,
  };
}
