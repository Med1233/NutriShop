'use client';

import { useLanguage } from '../i18n/LanguageContext';
import { useOrderManager } from '../hooks';
import { STATUS_COLORS, ORDER_STATUSES } from '../types';
import { PageTitle, StatGrid, StatCard, FilterPills, Card, DetailPanel, ToggleButton } from '@nutrishop/ui';

export default function ManagerPage() {
  const { t } = useLanguage();
  const {
    orders, loading, expandedId, detail, filter, setFilter,
    filteredOrders, statusCounts, handleStatusChange, toggleDetail,
    authLoading, user,
  } = useOrderManager();

  if (authLoading || loading || !user || user.role === 'customer') return <p>{t('common.loading')}</p>;

  const filterOptions = [
    { key: 'all', label: `${t('manager.all')} (${orders.length})`, color: '#3b82f6' },
    ...ORDER_STATUSES.map(s => ({ key: s, label: `${t(`status.${s}`)} (${statusCounts[s] || 0})`, color: STATUS_COLORS[s] })),
  ];

  return (
    <main>
      <PageTitle color="blue">{t('manager.title')}</PageTitle>

      <StatGrid cols={5}>
        <StatCard value={orders.length} label={t('manager.totalOrders')} />
        {ORDER_STATUSES.map(s => (
          <StatCard key={s} value={statusCounts[s] || 0} label={t(`status.${s}`)} color={STATUS_COLORS[s]} />
        ))}
      </StatGrid>

      <div className="mb-6">
        <FilterPills options={filterOptions} active={filter} onChange={setFilter} />
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-center text-gray-500 p-8">{t('orders.empty')}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredOrders.map(order => (
            <Card key={order.id}>
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <h3 className="m-0 text-lg font-bold">#{order.id}</h3>
                  <p className="mt-0.5 mb-0 text-sm text-gray-700">{order.user_name} — {order.user_email}</p>
                  <p className="mt-0.5 mb-0 text-[0.8rem] text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">${parseFloat(order.total).toFixed(2)}</span>
                  <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)} className="px-2.5 py-1.5 rounded-md text-sm font-semibold border-2 cursor-pointer" style={{ color: STATUS_COLORS[order.status] || '#6b7280', borderColor: STATUS_COLORS[order.status] || '#d1d5db' }}>
                    {ORDER_STATUSES.map(s => (<option key={s} value={s}>{t(`status.${s}`)}</option>))}
                  </select>
                </div>
              </div>
              <ToggleButton expanded={expandedId === order.id} onClick={() => toggleDetail(order.id)} color="blue">{t('orders.details')}</ToggleButton>
              {expandedId === order.id && detail && detail.id === order.id && (
                <DetailPanel>
                  <p className="text-sm text-gray-500 mb-3">{t('orders.shippingTo')}: {detail.shipping_address}</p>
                  {detail.items.map(item => (
                    <div key={item.id} className="flex justify-between py-1 text-[0.9rem] border-b border-gray-100">
                      <span>{item.name}</span>
                      <span>x{item.quantity} — ${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </DetailPanel>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
