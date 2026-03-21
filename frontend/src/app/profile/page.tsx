'use client';

import Link from 'next/link';
import { useLanguage } from '../i18n/LanguageContext';
import { useProfile } from '../hooks';
import { STATUS_COLORS } from '../types';

export default function ProfilePage() {
  const { t } = useLanguage();
  const {
    user, authLoading, isCustomer, editing, setEditing, form, setForm,
    saving, saveMsg, tab, setTab, orders, ordersLoaded, expandedId,
    detail, handleSave, handleCancel, toggleDetail, totalSpent,
  } = useProfile();

  if (authLoading || (!ordersLoaded && isCustomer)) return <p>{t('common.loading')}</p>;
  if (!user) return null;

  return (
    <main>
      <div className="flex items-center gap-5 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl mb-6">
        <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center text-[1.75rem] font-bold shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-green-900 m-0 mb-0.5">{user.name}</h1>
          <p className="text-[0.95rem] text-green-800 m-0">{user.email}</p>
        </div>
      </div>

      {isCustomer ? (
        <div className="flex gap-2 mb-6 border-b-2 border-gray-200 pb-2">
          <button onClick={() => setTab('info')} className={`px-5 py-2 border-none rounded-t-md cursor-pointer text-[0.9rem] font-medium ${tab === 'info' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{t('profile.tabInfo')}</button>
          <button onClick={() => setTab('orders')} className={`px-5 py-2 border-none rounded-t-md cursor-pointer text-[0.9rem] font-medium ${tab === 'orders' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{t('profile.tabOrders')} ({orders.length})</button>
        </div>
      ) : null}

      {(tab === 'info' || !isCustomer) && (
        <div>
          {isCustomer && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-[10px] p-5 flex flex-col items-center gap-1">
                <span className="text-[1.75rem] font-extrabold text-gray-900">{orders.length}</span>
                <span className="text-[0.8rem] text-gray-500 font-medium">{t('profile.totalOrders')}</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-[10px] p-5 flex flex-col items-center gap-1">
                <span className="text-[1.75rem] font-extrabold text-green-600">${totalSpent.toFixed(2)}</span>
                <span className="text-[0.8rem] text-gray-500 font-medium">{t('profile.totalSpent')}</span>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-[10px] p-5 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold m-0 text-gray-900">{t('profile.personalInfo')}</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="bg-transparent border border-green-600 text-green-600 px-4 py-1.5 rounded-md cursor-pointer text-sm font-semibold">{t('profile.edit')}</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleCancel} className="bg-transparent border border-gray-300 text-gray-700 px-4 py-1.5 rounded-md cursor-pointer text-sm font-medium">{t('admin.cancel')}</button>
                  <button onClick={handleSave} disabled={saving} className="bg-green-600 text-white border-none px-4 py-1.5 rounded-md cursor-pointer text-sm font-semibold">{saving ? t('profile.saving') : t('profile.save')}</button>
                </div>
              )}
            </div>

            {saveMsg && <p className={`text-sm mb-3 ${saveMsg === 'saved' ? 'text-green-600' : 'text-red-500'}`}>{saveMsg === 'saved' ? t('profile.saved') : saveMsg}</p>}

            {[
              { label: t('profile.name'), value: user.name, field: 'name' as const, editable: true },
              { label: t('profile.email'), value: user.email, field: null, editable: false },
              { label: t('profile.phone'), value: user.phone || '—', field: 'phone' as const, editable: true, placeholder: t('profile.phonePlaceholder') },
              { label: t('profile.address'), value: user.address || '—', field: 'address' as const, editable: true, placeholder: t('profile.addressPlaceholder') },
            ].map(({ label, value, field, editable, placeholder }) => (
              <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-100 gap-4">
                <span className="text-[0.9rem] text-gray-500 shrink-0">{label}</span>
                {editing && editable && field ? (
                  <input value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} placeholder={placeholder} className="text-[0.9rem] px-2.5 py-1.5 border border-gray-300 rounded-md w-[260px] max-w-[60%] text-end box-border" />
                ) : (
                  <span className="text-[0.9rem] font-medium text-gray-900 text-end">{value}</span>
                )}
              </div>
            ))}

            <div className="flex justify-between items-center py-2.5 border-b border-gray-100 gap-4">
              <span className="text-[0.9rem] text-gray-500 shrink-0">{t('profile.authMethod')}</span>
              <span className="text-[0.7rem] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full uppercase font-semibold">{user.provider}</span>
            </div>

            {!isCustomer && (
              <div className="flex justify-between items-center py-2.5 border-b border-gray-100 gap-4">
                <span className="text-[0.9rem] text-gray-500 shrink-0">{t('profile.role')}</span>
                <span className="text-[0.9rem] font-medium text-gray-900 text-end">{user.role}</span>
              </div>
            )}
          </div>

          {isCustomer && (
            <div className="bg-white border border-gray-200 rounded-[10px] p-5 mb-4">
              <h2 className="text-lg font-bold m-0 text-gray-900 mb-4">{t('profile.quickLinks')}</h2>
              <div className="flex gap-3">
                <Link href="/" className="flex-1 block text-center bg-white text-green-600 border border-green-600 py-2.5 rounded-lg no-underline font-semibold text-[0.9rem]">{t('profile.browseProducts')}</Link>
                <Link href="/cart" className="flex-1 block text-center bg-white text-green-600 border border-green-600 py-2.5 rounded-lg no-underline font-semibold text-[0.9rem]">{t('profile.viewCart')}</Link>
              </div>
            </div>
          )}
        </div>
      )}

      {isCustomer && tab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p>{t('orders.empty')}</p>
              <Link href="/" className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-lg no-underline font-semibold mt-2">{t('cart.continueShopping')}</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map(order => (
                <div key={order.id} className="border border-gray-200 rounded-[10px] p-5">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h3 className="m-0 text-base font-semibold">{t('orders.order', { id: String(order.id) })}</h3>
                      <p className="mt-1 mb-0 text-[0.8rem] text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-2.5 py-[3px] rounded-xl capitalize" style={{ background: (STATUS_COLORS[order.status] || '#6b7280') + '20', color: STATUS_COLORS[order.status] || '#6b7280' }}>
                        {t(`status.${order.status}`)}
                      </span>
                      <span className="font-bold text-lg">${parseFloat(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={() => toggleDetail(order.id)} className="bg-transparent border-none text-green-600 cursor-pointer text-sm font-medium pt-2 p-0">
                    {expandedId === order.id ? '▲' : '▼'} {t('orders.details')}
                  </button>
                  {expandedId === order.id && detail && detail.id === order.id && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-3">{t('orders.shippingTo')}: {detail.shipping_address}</p>
                      {detail.items.map(item => (
                        <div key={item.id} className="flex justify-between py-1 text-[0.9rem]">
                          <Link href={`/products/${item.product_id}`} className="text-gray-900 no-underline font-medium">{item.name}</Link>
                          <span>x{item.quantity} — ${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
