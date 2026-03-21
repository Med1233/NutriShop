import { useEffect, useState } from 'react';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../api/productApi';
import type { Product, ProductFormData } from '../types';

const EMPTY_FORM: ProductFormData = {
  name: '',
  description: '',
  price: '',
  category: 'proteins',
  stock: '0',
};

export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>({ ...EMPTY_FORM });

  const load = () =>
    fetchProducts()
      .then(setProducts)
      .catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditing(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    const body = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
    };
    if (editing) {
      await updateProduct(editing.id, body);
    } else {
      await createProduct(body);
    }
    resetForm();
    load();
  };

  const handleEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      stock: String(p.stock),
    });
    setEditing(p);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    await deleteProduct(id);
    load();
  };

  return {
    products,
    showForm,
    setShowForm,
    editing,
    form,
    setForm,
    resetForm,
    handleSave,
    handleEdit,
    handleDelete,
  };
}
