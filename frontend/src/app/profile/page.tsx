'use client';

import Link from 'next/link';
import { useLanguage } from '../i18n/LanguageContext';
import { useProfile } from '../hooks';
import { STATUS_COLORS } from '../types';

export default function ProfilePage() {
  const { t } = useLanguage();
  const {
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
  } = useProfile();

  if (authLoading || (!ordersLoaded && isCustomer))
    return <p>{t('common.loading')}</p>;
  if (!user) return null;

  return (
    <main>
      <div className="mb-6 flex items-center gap-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-600 text-[1.75rem] font-bold text-white">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="m-0 mb-0.5 text-2xl font-bold text-green-900">
            {user.name}
          </h1>
          <p className="m-0 text-[0.95rem] text-green-800">{user.email}</p>
        </div>
      </div>

      {isCustomer ? (
        <div className="mb-6 flex gap-2 border-b-2 border-gray-200 pb-2">
          <button
            onClick={() => setTab('info')}
            className={`cursor-pointer rounded-t-md border-none px-5 py-2 text-[0.9rem] font-medium ${tab === 'info' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('profile.tabInfo')}
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`cursor-pointer rounded-t-md border-none px-5 py-2 text-[0.9rem] font-medium ${tab === 'orders' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {t('profile.tabOrders')} ({orders.length})
          </button>
        </div>
      ) : null}

      {(tab === 'info' || !isCustomer) && (
        <div>
          {isCustomer && (
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center gap-1 rounded-[10px] border border-gray-200 bg-white p-5">
                <span className="text-[1.75rem] font-extrabold text-gray-900">
                  {orders.length}
                </span>
                <span className="text-[0.8rem] font-medium text-gray-500">
                  {t('profile.totalOrders')}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-[10px] border border-gray-200 bg-white p-5">
                <span className="text-[1.75rem] font-extrabold text-green-600">
                  ${totalSpent.toFixed(2)}
                </span>
                <span className="text-[0.8rem] font-medium text-gray-500">
                  {t('profile.totalSpent')}
                </span>
              </div>
            </div>
          )}

          <div className="mb-4 rounded-[10px] border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="m-0 text-lg font-bold text-gray-900">
                {t('profile.personalInfo')}
              </h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="cursor-pointer rounded-md border border-green-600 bg-transparent px-4 py-1.5 text-sm font-semibold text-green-600"
                >
                  {t('profile.edit')}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="cursor-pointer rounded-md border border-gray-300 bg-transparent px-4 py-1.5 text-sm font-medium text-gray-700"
                  >
                    {t('admin.cancel')}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="cursor-pointer rounded-md border-none bg-green-600 px-4 py-1.5 text-sm font-semibold text-white"
                  >
                    {saving ? t('profile.saving') : t('profile.save')}
                  </button>
                </div>
              )}
            </div>

            {saveMsg && (
              <p
                className={`mb-3 text-sm ${saveMsg === 'saved' ? 'text-green-600' : 'text-red-500'}`}
              >
                {saveMsg === 'saved' ? t('profile.saved') : saveMsg}
              </p>
            )}

            {[
              {
                label: t('profile.name'),
                value: user.name,
                field: 'name' as const,
                editable: true,
              },
              {
                label: t('profile.email'),
                value: user.email,
                field: null,
                editable: false,
              },
              {
                label: t('profile.phone'),
                value: user.phone || '—',
                field: 'phone' as const,
                editable: true,
                placeholder: t('profile.phonePlaceholder'),
              },
              {
                label: t('profile.address'),
                value: user.address || '—',
                field: 'address' as const,
                editable: true,
                placeholder: t('profile.addressPlaceholder'),
              },
            ].map(({ label, value, field, editable, placeholder }) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 border-b border-gray-100 py-2.5"
              >
                <span className="shrink-0 text-[0.9rem] text-gray-500">
                  {label}
                </span>
                {editing && editable && field ? (
                  <input
                    value={form[field]}
                    onChange={(e) =>
                      setForm({ ...form, [field]: e.target.value })
                    }
                    placeholder={placeholder}
                    className="box-border w-[260px] max-w-[60%] rounded-md border border-gray-300 px-2.5 py-1.5 text-end text-[0.9rem]"
                  />
                ) : (
                  <span className="text-end text-[0.9rem] font-medium text-gray-900">
                    {value}
                  </span>
                )}
              </div>
            ))}

            <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-2.5">
              <span className="shrink-0 text-[0.9rem] text-gray-500">
                {t('profile.authMethod')}
              </span>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[0.7rem] font-semibold uppercase text-indigo-800">
                {user.provider}
              </span>
            </div>

            {!isCustomer && (
              <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-2.5">
                <span className="shrink-0 text-[0.9rem] text-gray-500">
                  {t('profile.role')}
                </span>
                <span className="text-end text-[0.9rem] font-medium text-gray-900">
                  {user.role}
                </span>
              </div>
            )}
          </div>

          {isCustomer && (
            <div className="mb-4 rounded-[10px] border border-gray-200 bg-white p-5">
              <h2 className="m-0 mb-4 text-lg font-bold text-gray-900">
                {t('profile.quickLinks')}
              </h2>
              <div className="flex gap-3">
                <Link
                  href="/"
                  className="block flex-1 rounded-lg border border-green-600 bg-white py-2.5 text-center text-[0.9rem] font-semibold text-green-600 no-underline"
                >
                  {t('profile.browseProducts')}
                </Link>
                <Link
                  href="/cart"
                  className="block flex-1 rounded-lg border border-green-600 bg-white py-2.5 text-center text-[0.9rem] font-semibold text-green-600 no-underline"
                >
                  {t('profile.viewCart')}
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {isCustomer && tab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <div className="py-12 text-center">
              <p>{t('orders.empty')}</p>
              <Link
                href="/"
                className="mt-2 inline-block rounded-lg bg-green-600 px-6 py-2.5 font-semibold text-white no-underline"
              >
                {t('cart.continueShopping')}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-[10px] border border-gray-200 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="m-0 text-base font-semibold">
                        {t('orders.order', { id: String(order.id) })}
                      </h3>
                      <p className="mb-0 mt-1 text-[0.8rem] text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="rounded-xl px-2.5 py-[3px] text-xs font-semibold capitalize"
                        style={{
                          background:
                            (STATUS_COLORS[order.status] || '#6b7280') + '20',
                          color: STATUS_COLORS[order.status] || '#6b7280',
                        }}
                      >
                        {t(`status.${order.status}`)}
                      </span>
                      <span className="text-lg font-bold">
                        ${parseFloat(order.total).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleDetail(order.id)}
                    className="cursor-pointer border-none bg-transparent p-0 pt-2 text-sm font-medium text-green-600"
                  >
                    {expandedId === order.id ? '▲' : '▼'} {t('orders.details')}
                  </button>
                  {expandedId === order.id &&
                    detail &&
                    detail.id === order.id && (
                      <div className="mt-3 rounded-lg bg-gray-50 p-4">
                        <p className="mb-3 text-sm text-gray-500">
                          {t('orders.shippingTo')}: {detail.shipping_address}
                        </p>
                        {detail.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between py-1 text-[0.9rem]"
                          >
                            <Link
                              href={`/products/${item.product_id}`}
                              className="font-medium text-gray-900 no-underline"
                            >
                              {item.name}
                            </Link>
                            <span>
                              x{item.quantity} — $
                              {(parseFloat(item.price) * item.quantity).toFixed(
                                2,
                              )}
                            </span>
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
