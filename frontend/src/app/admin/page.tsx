'use client';

import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  useAdminPanel,
  useAdminProducts,
  useAdminUsers,
  useAdminOrders,
} from '../hooks';
import { STATUS_COLORS, ORDER_STATUSES, PRODUCT_CATEGORIES } from '../types';
import {
  PageTitle,
  StatGrid,
  StatCard,
  Tabs,
  Card,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  FormRow,
  Table,
  Th,
  Td,
  ProviderBadge,
} from '@nutrishop/ui';

export default function AdminPage() {
  const { t } = useLanguage();
  const { tab, setTab, stats, user, authLoading } = useAdminPanel();

  if (authLoading || !user || user.role !== 'admin')
    return <p>{t('common.loading')}</p>;

  return (
    <main>
      <PageTitle color="red">{t('admin.title')}</PageTitle>

      {stats && (
        <StatGrid cols={4}>
          <StatCard value={stats.totalUsers} label={t('admin.totalUsers')} />
          <StatCard
            value={stats.totalProducts}
            label={t('admin.totalProducts')}
          />
          <StatCard value={stats.totalOrders} label={t('admin.totalOrders')} />
          <StatCard
            value={`$${stats.totalRevenue.toFixed(2)}`}
            label={t('admin.totalRevenue')}
            color="#16a34a"
          />
        </StatGrid>
      )}

      <Tabs
        tabs={[
          { key: 'products', label: t('admin.tab.products') },
          { key: 'users', label: t('admin.tab.users') },
          { key: 'orders', label: t('admin.tab.orders') },
        ]}
        active={tab}
        onChange={(k) => setTab(k as 'products' | 'users' | 'orders')}
        color="red"
      />

      {tab === 'products' && <ProductsTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'orders' && <OrdersTab />}
    </main>
  );
}

function ProductsTab() {
  const { t } = useLanguage();
  const {
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
  } = useAdminProducts();

  return (
    <div>
      <CardHeader title={t('admin.tab.products')}>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? t('admin.cancel') : t('admin.addProduct')}
        </Button>
      </CardHeader>

      {showForm && (
        <Card variant="form" className="mb-6 flex flex-col gap-3">
          <Input
            placeholder={t('admin.productName')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Textarea
            placeholder={t('admin.productDesc')}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
          <FormRow>
            <Input
              placeholder={t('admin.price')}
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <Input
              placeholder={t('admin.stock')}
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`categories.${c}`)}
                </option>
              ))}
            </Select>
          </FormRow>
          <Button
            variant="secondary"
            onClick={handleSave}
            className="self-start"
          >
            {editing ? t('admin.update') : t('admin.create')}
          </Button>
        </Card>
      )}

      <Table>
        <colgroup>
          <col className="w-[5%]" />
          <col className="w-[30%]" />
          <col className="w-[12%]" />
          <col className="w-[18%]" />
          <col className="w-[10%]" />
          <col className="w-[25%]" />
        </colgroup>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>{t('admin.productName')}</Th>
            <Th>{t('admin.price')}</Th>
            <Th>{t('product.category')}</Th>
            <Th>{t('admin.stock')}</Th>
            <Th>{t('admin.actions')}</Th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <Td>{p.id}</Td>
              <Td>{p.name}</Td>
              <Td>${parseFloat(p.price).toFixed(2)}</Td>
              <Td>{t(`categories.${p.category}`)}</Td>
              <Td>{p.stock}</Td>
              <Td>
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => handleEdit(p)}
                  className="mr-1.5 !border !border-blue-500 !bg-transparent !text-blue-500"
                >
                  {t('admin.edit')}
                </Button>
                <Button
                  variant="danger"
                  size="xs"
                  onClick={() => {
                    if (confirm(t('admin.confirmDelete'))) handleDelete(p.id);
                  }}
                >
                  {t('admin.delete')}
                </Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function UsersTab() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const {
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
  } = useAdminUsers();

  return (
    <div>
      <CardHeader title={t('admin.tab.users')}>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setFormError('');
          }}
        >
          {showForm ? t('admin.cancel') : t('admin.addUser')}
        </Button>
      </CardHeader>

      {showForm && (
        <Card variant="form" className="mb-6 flex flex-col gap-3">
          <FormRow>
            <Input
              placeholder={t('admin.userName')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder={t('admin.email')}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              placeholder={t('admin.password')}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </FormRow>
          <div className="flex items-center gap-3">
            <Select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="customer">{t('admin.roleCustomer')}</option>
              <option value="manager">{t('admin.roleManager')}</option>
              <option value="stockist">{t('admin.roleStockist')}</option>
              <option value="admin">{t('admin.roleAdmin')}</option>
            </Select>
            <Button variant="secondary" onClick={handleCreateUser}>
              {t('admin.create')}
            </Button>
          </div>
          {formError && <p className="m-0 text-sm text-red-500">{formError}</p>}
        </Card>
      )}

      <Table>
        <colgroup>
          <col className="w-[5%]" />
          <col className="w-[20%]" />
          <col className="w-[28%]" />
          <col className="w-[17%]" />
          <col className="w-[15%]" />
          <col className="w-[15%]" />
        </colgroup>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>{t('admin.userName')}</Th>
            <Th>{t('admin.email')}</Th>
            <Th>{t('admin.role')}</Th>
            <Th>{t('admin.provider')}</Th>
            <Th>{t('admin.actions')}</Th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <Td>{u.id}</Td>
              <Td>{u.name}</Td>
              <Td>{u.email}</Td>
              <Td>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  disabled={u.id === currentUser?.id}
                  className="rounded border border-gray-300 px-2 py-1 text-[0.8rem]"
                >
                  <option value="customer">{t('admin.roleCustomer')}</option>
                  <option value="manager">{t('admin.roleManager')}</option>
                  <option value="stockist">{t('admin.roleStockist')}</option>
                  <option value="admin">{t('admin.roleAdmin')}</option>
                </select>
              </Td>
              <Td>
                <ProviderBadge provider={u.provider} />
              </Td>
              <Td>
                {u.id !== currentUser?.id && (
                  <Button
                    variant="danger"
                    size="xs"
                    onClick={() => {
                      if (confirm(t('admin.confirmDelete'))) handleDelete(u.id);
                    }}
                  >
                    {t('admin.delete')}
                  </Button>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function OrdersTab() {
  const { t } = useLanguage();
  const { orders, handleStatusChange } = useAdminOrders();

  return (
    <div>
      <h2 className="m-0 mb-4 text-lg font-bold">{t('admin.tab.orders')}</h2>
      <Table>
        <colgroup>
          <col className="w-[5%]" />
          <col className="w-[20%]" />
          <col className="w-[10%]" />
          <col className="w-[18%]" />
          <col className="w-[15%]" />
          <col className="w-[16%]" />
          <col className="w-[16%]" />
        </colgroup>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>{t('admin.customer')}</Th>
            <Th>{t('common.total')}</Th>
            <Th>{t('orders.status')}</Th>
            <Th>{t('admin.updatedBy')}</Th>
            <Th>{t('admin.createdAt')}</Th>
            <Th>{t('admin.updatedAt')}</Th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <Td>#{o.id}</Td>
              <Td>
                <div>{o.user_name}</div>
                <div className="text-xs text-gray-500">{o.user_email}</div>
              </Td>
              <Td>${parseFloat(o.total).toFixed(2)}</Td>
              <Td>
                <select
                  value={o.status}
                  onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  className="cursor-pointer rounded border px-2 py-1 text-[0.8rem] font-semibold"
                  style={{
                    color: STATUS_COLORS[o.status] || '#6b7280',
                    borderColor: STATUS_COLORS[o.status] || '#d1d5db',
                  }}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t(`status.${s}`)}
                    </option>
                  ))}
                </select>
              </Td>
              <Td className="text-[0.8rem]">
                {o.status_updated_by_name || (
                  <span className="text-gray-400">—</span>
                )}
              </Td>
              <Td className="text-[0.8rem]">
                {new Date(o.created_at).toLocaleDateString()}
              </Td>
              <Td className="text-[0.8rem]">
                {o.status_updated_at ? (
                  new Date(o.status_updated_at).toLocaleDateString()
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {orders.length === 0 && (
        <p className="p-8 text-center text-gray-500">{t('orders.empty')}</p>
      )}
    </div>
  );
}
