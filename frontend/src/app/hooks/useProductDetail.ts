import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { fetchProduct } from '../api/productApi';
import type { Product } from '../types';

export function useProductDetail() {
  const params = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const isCustomer = !user || user.role === 'customer';

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct(params.id as string)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleAdd = async () => {
    if (!product) return;
    const result = await addToCart(product.id, quantity);
    if (!result.error) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  const nutrition = product?.nutrition_info || {};
  const servingSize = nutrition.serving_size;
  const nutritionEntries = Object.entries(nutrition).filter(
    ([key]) => key !== 'serving_size',
  );

  return {
    product,
    loading,
    added,
    quantity,
    setQuantity,
    handleAdd,
    isCustomer,
    nutritionEntries,
    servingSize,
  };
}
