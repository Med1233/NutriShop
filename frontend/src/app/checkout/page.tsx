'use client';

import Link from 'next/link';
import { useLanguage } from '../i18n/LanguageContext';
import { useCheckout } from '../hooks';
import { PageTitle, Card, Button, Textarea, LinkButton } from '@nutrishop/ui';

export default function CheckoutPage() {
  const { t } = useLanguage();
  const {
    user,
    authLoading,
    items,
    loading,
    address,
    setAddress,
    submitting,
    error,
    orderId,
    subtotal,
    handleSubmit,
    router,
  } = useCheckout();

  if (authLoading || loading) return <p>{t('common.loading')}</p>;

  if (!user) {
    router.push('/login?redirect=/checkout');
    return null;
  }

  if (orderId) {
    return (
      <main className="py-12 text-center">
        <h1 className="text-2xl text-green-600">{t('checkout.orderPlaced')}</h1>
        <p className="mb-6 mt-2 text-lg text-gray-700">
          {t('checkout.orderNumber', { id: String(orderId) })}
        </p>
        <LinkButton as={Link} href="/profile">
          {t('checkout.viewOrders')}
        </LinkButton>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main>
        <h1>{t('checkout.title')}</h1>
        <p>{t('cart.empty')}</p>
        <LinkButton as={Link} href="/" variant="ghost">
          {t('cart.continueShopping')}
        </LinkButton>
      </main>
    );
  }

  return (
    <main>
      <PageTitle>{t('checkout.title')}</PageTitle>

      <Card variant="muted" className="mb-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between py-1.5 text-[0.95rem]"
          >
            <span>
              {item.name} x{item.quantity}
            </span>
            <span className="font-semibold">
              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-lg">
          <strong>{t('common.total')}</strong>
          <strong className="text-xl text-green-600">
            ${subtotal.toFixed(2)}
          </strong>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="text-[0.95rem] font-semibold">
          {t('checkout.shippingAddress')}
        </label>
        <Textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t('checkout.addressPlaceholder')}
          required
          rows={3}
        />
        {error && <p className="m-0 text-red-500">{error}</p>}
        <Button
          type="submit"
          disabled={submitting}
          size="md"
          className="w-full"
        >
          {submitting ? t('checkout.placing') : t('checkout.placeOrder')}
        </Button>
      </form>
    </main>
  );
}
