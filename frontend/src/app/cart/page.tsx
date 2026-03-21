'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../i18n/LanguageContext';
import ProductImage from '../components/ProductImage';
import { PageTitle, EmptyState, LinkButton, Button, Card, Select } from '@nutrishop/ui';

export default function CartPage() {
  const { items, loading, updateQuantity, removeItem } = useCart();
  const { t } = useLanguage();

  if (loading) return <p>{t('common.loading')}</p>;

  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

  return (
    <main>
      <PageTitle>{t('cart.title')}</PageTitle>

      {items.length === 0 ? (
        <EmptyState message={t('cart.empty')} actionLabel={t('cart.continueShopping')} actionHref="/" linkComponent={Link} />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {items.map(item => (
              <Card key={item.id} className="flex justify-between items-center flex-wrap gap-3">
                <div className="flex items-center gap-4 flex-1 min-w-[250px]">
                  <ProductImage category={item.category} name={item.name} imageUrl={item.image_url} size="small" />
                  <div className="flex-1">
                    <Link href={`/products/${item.product_id}`} className="text-base font-semibold text-gray-900 no-underline">{item.name}</Link>
                    <p className="text-sm text-gray-500 mt-1 mb-0">${parseFloat(item.price).toFixed(2)} each</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Select value={item.quantity} onChange={e => updateQuantity(item.id, Number(e.target.value))} className="!w-auto !p-1.5">
                    {Array.from({ length: item.stock }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </Select>
                  <span className="font-bold text-base min-w-[70px] text-right">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  <Button variant="danger" size="xs" onClick={() => removeItem(item.id)}>{t('common.remove')}</Button>
                </div>
              </Card>
            ))}
          </div>

          <Card variant="muted" className="mt-8">
            <div className="flex justify-between mb-4">
              <span className="text-lg font-semibold">{t('cart.subtotal')}</span>
              <span className="text-2xl font-extrabold text-green-600">${subtotal.toFixed(2)}</span>
            </div>
            <LinkButton as={Link} href="/checkout" className="block w-full">{t('cart.checkout')}</LinkButton>
          </Card>
        </>
      )}
    </main>
  );
}
