'use client';

import { useLanguage } from '../i18n/LanguageContext';
import { useStockist } from '../hooks';
import { PRODUCT_CATEGORIES } from '../types';

export default function StockistPage() {
  const { t } = useLanguage();
  const {
    loading,
    showForm,
    setShowForm,
    editing,
    form,
    setForm,
    filter,
    setFilter,
    resetForm,
    handleSave,
    handleEdit,
    handleDelete,
    categories,
    filtered,
    lowStock,
    products,
    user,
    authLoading,
  } = useStockist();

  if (authLoading || loading) return <p>{t('common.loading')}</p>;
  if (!user || (user.role !== 'stockist' && user.role !== 'admin')) return null;

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold text-violet-500">
        {t('stockist.title')}
      </h1>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-0.5 rounded-[10px] border border-gray-200 bg-white p-4">
          <span className="text-2xl font-extrabold text-gray-900">
            {products.length}
          </span>
          <span className="text-xs text-gray-500">
            {t('stockist.totalProducts')}
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5 rounded-[10px] border border-gray-200 bg-white p-4">
          <span className="text-2xl font-extrabold text-gray-900">
            {categories.length}
          </span>
          <span className="text-xs text-gray-500">
            {t('stockist.categories')}
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5 rounded-[10px] border border-gray-200 bg-white p-4">
          <span
            className="text-2xl font-extrabold"
            style={{ color: lowStock > 0 ? '#ef4444' : '#16a34a' }}
          >
            {lowStock}
          </span>
          <span className="text-xs text-gray-500">
            {t('stockist.lowStock')}
          </span>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('')}
            className={`cursor-pointer rounded-full border-none px-4 py-1.5 text-sm font-medium ${filter === '' ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('stockist.all')} ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`cursor-pointer rounded-full border-none px-4 py-1.5 text-sm font-medium ${filter === c ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t(`categories.${c}`)}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="cursor-pointer whitespace-nowrap rounded-md border-none bg-violet-500 px-4 py-2 text-sm font-semibold text-white"
        >
          {showForm ? t('admin.cancel') : t('admin.addProduct')}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 flex flex-col gap-3 rounded-[10px] border border-gray-200 bg-gray-50 p-5">
          <input
            placeholder={t('admin.productName')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="box-border w-full rounded-md border border-gray-300 p-2 px-3 text-[0.9rem]"
          />
          <textarea
            placeholder={t('admin.productDesc')}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="box-border w-full resize-y rounded-md border border-gray-300 p-2 px-3 text-[0.9rem]"
            rows={2}
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              placeholder={t('admin.price')}
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="box-border w-full rounded-md border border-gray-300 p-2 px-3 text-[0.9rem]"
            />
            <input
              placeholder={t('admin.stock')}
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="box-border w-full rounded-md border border-gray-300 p-2 px-3 text-[0.9rem]"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="box-border w-full rounded-md border border-gray-300 p-2 px-3 text-[0.9rem]"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`categories.${c}`)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSave}
            className="cursor-pointer self-start rounded-md border-none bg-violet-500 px-6 py-2 font-semibold text-white"
          >
            {editing ? t('admin.update') : t('admin.create')}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className={`flex flex-wrap items-center justify-between gap-4 rounded-[10px] border px-5 py-4 ${p.stock < 20 ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
          >
            <div className="min-w-[250px] flex-1">
              <div className="mb-1 flex items-center gap-3">
                <span className="text-base font-semibold text-gray-900">
                  {p.name}
                </span>
                <span className="rounded-[10px] bg-gray-100 px-2 py-0.5 text-[0.7rem] font-semibold uppercase text-gray-500">
                  {t(`categories.${p.category}`)}
                </span>
              </div>
              <p className="mb-2 text-[0.8rem] leading-snug text-gray-500">
                {p.description}
              </p>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-gray-900">
                  ${parseFloat(p.price).toFixed(2)}
                </span>
                <span
                  className="text-[0.8rem] font-semibold"
                  style={{ color: p.stock < 20 ? '#ef4444' : '#16a34a' }}
                >
                  {t('product.inStock', { count: String(p.stock) })}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => handleEdit(p)}
                className="cursor-pointer rounded-md border border-violet-500 bg-transparent px-3 py-1 text-[0.8rem] text-violet-500"
              >
                {t('admin.edit')}
              </button>
              <button
                onClick={() => {
                  if (confirm(t('admin.confirmDelete'))) handleDelete(p.id);
                }}
                className="cursor-pointer rounded-md border border-red-500 bg-transparent px-3 py-1 text-[0.8rem] text-red-500"
              >
                {t('admin.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
