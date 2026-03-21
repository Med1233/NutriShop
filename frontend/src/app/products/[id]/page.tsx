'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '../../i18n/LanguageContext';
import { useProductDetail } from '../../hooks';
import { CATEGORY_COLORS } from '../../types';
import ProductImage from '../../components/ProductImage';

export default function ProductDetailPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const {
    product,
    loading,
    added,
    quantity,
    setQuantity,
    handleAdd,
    isCustomer,
    nutritionEntries,
    servingSize,
  } = useProductDetail();

  if (loading) return <p>{t('common.loading')}</p>;
  if (!product) return <p>{t('product.notFound')}</p>;

  return (
    <main>
      <button
        onClick={() => router.back()}
        className="mb-6 cursor-pointer border-none bg-transparent p-0 text-[0.9rem] font-medium text-green-600"
      >
        &larr; {t('common.back')}
      </button>

      <div className="grid grid-cols-2 gap-8">
        <ProductImage
          category={product.category}
          name={product.name}
          imageUrl={product.image_url}
          size="large"
        />

        <div className="flex flex-col">
          <span
            className="self-start rounded-xl px-2.5 py-[3px] text-xs font-semibold uppercase"
            style={{
              background:
                (CATEGORY_COLORS[product.category] || '#6b7280') + '20',
              color: CATEGORY_COLORS[product.category] || '#6b7280',
            }}
          >
            {t(`categories.${product.category}`)}
          </span>

          <h1 className="mb-2 mt-3 text-[1.75rem] font-bold text-gray-900">
            {product.name}
          </h1>
          <p className="mb-4 text-base leading-relaxed text-gray-600">
            {product.description}
          </p>
          <p className="mb-1 text-3xl font-extrabold text-green-600">
            ${parseFloat(product.price).toFixed(2)}
          </p>
          <p className="mb-4 text-sm text-gray-500">
            {product.stock > 0
              ? t('product.inStock', { count: String(product.stock) })
              : t('common.outOfStock')}
          </p>

          {isCustomer && product.stock > 0 && (
            <div className="mb-6 flex items-center gap-3">
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="rounded-md border border-gray-300 p-2 text-[0.9rem]"
              >
                {Array.from({ length: product.stock }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAdd}
                className="cursor-pointer rounded-lg border-none px-6 py-2.5 text-[0.95rem] font-semibold text-white"
                style={{ background: added ? '#22c55e' : '#16a34a' }}
              >
                {added ? t('common.added') : t('common.addToCart')}
              </button>
            </div>
          )}

          {nutritionEntries.length > 0 && (
            <div className="rounded-[10px] border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-1 text-base font-bold text-gray-900">
                {t('product.nutritionInfo')}
              </h3>
              {servingSize && (
                <p className="mb-3 text-[0.8rem] text-gray-500">
                  {t('product.perServing', { size: servingSize })}
                </p>
              )}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {nutritionEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between border-b border-gray-200 py-1 text-sm"
                  >
                    <span className="capitalize text-gray-500">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
