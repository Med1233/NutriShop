'use client';

import { useLanguage } from '../i18n/LanguageContext';
import { useStockist } from '../hooks';
import { PRODUCT_CATEGORIES } from '../types';

export default function StockistPage() {
  const { t } = useLanguage();
  const {
    loading, showForm, setShowForm, editing, form, setForm,
    filter, setFilter, resetForm, handleSave, handleEdit, handleDelete,
    categories, filtered, lowStock, products, user, authLoading,
  } = useStockist();

  if (authLoading || loading) return <p>{t('common.loading')}</p>;
  if (!user || (user.role !== 'stockist' && user.role !== 'admin')) return null;

  return (
    <main>
      <h1 className="text-2xl font-bold mb-6 text-violet-500">{t('stockist.title')}</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-[10px] p-4 flex flex-col items-center gap-0.5">
          <span className="text-2xl font-extrabold text-gray-900">{products.length}</span>
          <span className="text-xs text-gray-500">{t('stockist.totalProducts')}</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-[10px] p-4 flex flex-col items-center gap-0.5">
          <span className="text-2xl font-extrabold text-gray-900">{categories.length}</span>
          <span className="text-xs text-gray-500">{t('stockist.categories')}</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-[10px] p-4 flex flex-col items-center gap-0.5">
          <span className="text-2xl font-extrabold" style={{ color: lowStock > 0 ? '#ef4444' : '#16a34a' }}>{lowStock}</span>
          <span className="text-xs text-gray-500">{t('stockist.lowStock')}</span>
        </div>
      </div>

      <div className="flex justify-between items-start gap-4 mb-6 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('')} className={`px-4 py-1.5 border-none rounded-full cursor-pointer text-sm font-medium ${filter === '' ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{t('stockist.all')} ({products.length})</button>
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`px-4 py-1.5 border-none rounded-full cursor-pointer text-sm font-medium ${filter === c ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{t(`categories.${c}`)}</button>
          ))}
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="bg-violet-500 text-white border-none px-4 py-2 rounded-md cursor-pointer font-semibold text-sm whitespace-nowrap">{showForm ? t('admin.cancel') : t('admin.addProduct')}</button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-[10px] p-5 mb-6 flex flex-col gap-3">
          <input placeholder={t('admin.productName')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="p-2 px-3 border border-gray-300 rounded-md text-[0.9rem] w-full box-border" />
          <textarea placeholder={t('admin.productDesc')} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="p-2 px-3 border border-gray-300 rounded-md text-[0.9rem] resize-y w-full box-border" rows={2} />
          <div className="grid grid-cols-3 gap-3">
            <input placeholder={t('admin.price')} type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="p-2 px-3 border border-gray-300 rounded-md text-[0.9rem] w-full box-border" />
            <input placeholder={t('admin.stock')} type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="p-2 px-3 border border-gray-300 rounded-md text-[0.9rem] w-full box-border" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="p-2 px-3 border border-gray-300 rounded-md text-[0.9rem] w-full box-border">
              {PRODUCT_CATEGORIES.map(c => (<option key={c} value={c}>{t(`categories.${c}`)}</option>))}
            </select>
          </div>
          <button onClick={handleSave} className="bg-violet-500 text-white border-none px-6 py-2 rounded-md cursor-pointer font-semibold self-start">{editing ? t('admin.update') : t('admin.create')}</button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map(p => (
          <div key={p.id} className={`flex justify-between items-center px-5 py-4 border rounded-[10px] gap-4 flex-wrap ${p.stock < 20 ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
            <div className="flex-1 min-w-[250px]">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-semibold text-base text-gray-900">{p.name}</span>
                <span className="text-[0.7rem] font-semibold px-2 py-0.5 rounded-[10px] bg-gray-100 text-gray-500 uppercase">{t(`categories.${p.category}`)}</span>
              </div>
              <p className="text-[0.8rem] text-gray-500 mb-2 leading-snug">{p.description}</p>
              <div className="flex items-center gap-4">
                <span className="font-bold text-lg text-gray-900">${parseFloat(p.price).toFixed(2)}</span>
                <span className="text-[0.8rem] font-semibold" style={{ color: p.stock < 20 ? '#ef4444' : '#16a34a' }}>{t('product.inStock', { count: String(p.stock) })}</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleEdit(p)} className="bg-transparent border border-violet-500 text-violet-500 px-3 py-1 rounded-md cursor-pointer text-[0.8rem]">{t('admin.edit')}</button>
              <button onClick={() => { if (confirm(t('admin.confirmDelete'))) handleDelete(p.id); }} className="bg-transparent border border-red-500 text-red-500 px-3 py-1 rounded-md cursor-pointer text-[0.8rem]">{t('admin.delete')}</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
