import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../api/productApi';
import type { Product, ProductFormData } from '../types';

const EMPTY_FORM: ProductFormData = { name: '', description: '', price: '', category: 'proteins', stock: '0' };

export function useStockist() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>({ ...EMPTY_FORM });
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'stockist' && user.role !== 'admin'))) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  const load = () => {
    fetchProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ ...EMPTY_FORM }); setEditing(null); setShowForm(false); };

  const handleSave = async () => {
    const body = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
    if (editing) {
      await updateProduct(editing.id, body);
    } else {
      await createProduct(body);
    }
    resetForm(); load();
  };

  const handleEdit = (p: Product) => {
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, stock: String(p.stock) });
    setEditing(p); setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    await deleteProduct(id);
    load();
  };

  const categories = [...new Set(products.map(p => p.category))].sort();
  const filtered = filter ? products.filter(p => p.category === filter) : products;
  const lowStock = products.filter(p => p.stock < 20).length;

  return {
    products, loading, showForm, setShowForm, editing, form, setForm,
    filter, setFilter, resetForm, handleSave, handleEdit, handleDelete,
    categories, filtered, lowStock, user, authLoading,
  };
}
