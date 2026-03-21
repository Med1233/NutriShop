import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/orderApi';

export function useCheckout() {
  const { user, loading: authLoading } = useAuth();
  const { items, loading, refresh } = useCart();
  const router = useRouter();

  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);

  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await createOrder(address);
      const data = await res.json();
      if (res.ok) {
        setOrderId(data.id);
        await refresh();
      } else {
        setError(data.error);
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    user,
    authLoading,
    items,
    loading,
    address,
    setAddress,
    submitting,
    error,
    orderId,
    subtotal,
    handleSubmit,
    router,
  };
}
