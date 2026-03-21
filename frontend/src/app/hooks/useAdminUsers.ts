import { useEffect, useState } from 'react';
import {
  fetchUsers,
  createUser,
  updateUserRole,
  deleteUser,
} from '../api/adminApi';
import type { AdminUser } from '../types';

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [formError, setFormError] = useState('');

  const load = () =>
    fetchUsers()
      .then(setUsers)
      .catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    await updateUserRole(userId, newRole);
    load();
  };

  const handleDelete = async (userId: number) => {
    await deleteUser(userId);
    load();
  };

  const handleCreateUser = async () => {
    setFormError('');
    const res = await createUser(form);
    if (res.ok) {
      setForm({ name: '', email: '', password: '', role: 'customer' });
      setShowForm(false);
      load();
    } else {
      const data = await res.json();
      setFormError(data.error || 'Error');
    }
  };

  return {
    users,
    showForm,
    setShowForm,
    form,
    setForm,
    formError,
    setFormError,
    handleRoleChange,
    handleDelete,
    handleCreateUser,
  };
}
