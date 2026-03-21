import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { fetchCategories, fetchProducts } from '../api/productApi';

export function useProductCatalog() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const isCustomer = !user || user.role === 'customer';

  const [products, setProducts] = useState<import('../types').Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [addedId, setAddedId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts({
      category: activeCategory || undefined,
      search: search || undefined,
    })
      .then(setProducts)
      .catch(() => {});
  }, [activeCategory, search]);

  const handleAddToCart = async (productId: number) => {
    const result = await addToCart(productId);
    if (!result.error) {
      setAddedId(productId);
      setTimeout(() => setAddedId(null), 1500);
    }
  };

  return {
    products,
    categories,
    activeCategory,
    setActiveCategory,
    search,
    setSearch,
    addedId,
    handleAddToCart,
    isCustomer,
  };
}
