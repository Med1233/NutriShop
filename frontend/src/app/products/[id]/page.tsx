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
    product, loading, added, quantity, setQuantity,
    handleAdd, isCustomer, nutritionEntries, servingSize,
  } = useProductDetail();

  if (loading) return <p>{t('common.loading')}</p>;
  if (!product) return <p>{t('product.notFound')}</p>;

  return (
    <main>
      <button onClick={() => router.back()} className="bg-transparent border-none text-green-600 cursor-pointer text-[0.9rem] font-medium p-0 mb-6">&larr; {t('common.back')}</button>

      <div className="grid grid-cols-2 gap-8">
        <ProductImage category={product.category} name={product.name} imageUrl={product.image_url} size="large" />

        <div className="flex flex-col">
          <span
            className="text-xs font-semibold px-2.5 py-[3px] rounded-xl uppercase self-start"
            style={{ background: (CATEGORY_COLORS[product.category] || '#6b7280') + '20', color: CATEGORY_COLORS[product.category] || '#6b7280' }}
          >
            {t(`categories.${product.category}`)}
          </span>

          <h1 className="text-[1.75rem] font-bold text-gray-900 mt-3 mb-2">{product.name}</h1>
          <p className="text-base text-gray-600 leading-relaxed mb-4">{product.description}</p>
          <p className="text-3xl font-extrabold text-green-600 mb-1">${parseFloat(product.price).toFixed(2)}</p>
          <p className="text-sm text-gray-500 mb-4">
            {product.stock > 0 ? t('product.inStock', { count: String(product.stock) }) : t('common.outOfStock')}
          </p>

          {isCustomer && product.stock > 0 && (
            <div className="flex gap-3 items-center mb-6">
              <select value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="p-2 rounded-md border border-gray-300 text-[0.9rem]">
                {Array.from({ length: product.stock }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              <button onClick={handleAdd} className="text-white border-none px-6 py-2.5 rounded-lg cursor-pointer text-[0.95rem] font-semibold" style={{ background: added ? '#22c55e' : '#16a34a' }}>
                {added ? t('common.added') : t('common.addToCart')}
              </button>
            </div>
          )}

          {nutritionEntries.length > 0 && (
            <div className="bg-gray-50 rounded-[10px] p-4 border border-gray-200">
              <h3 className="text-base font-bold mb-1 text-gray-900">{t('product.nutritionInfo')}</h3>
              {servingSize && <p className="text-[0.8rem] text-gray-500 mb-3">{t('product.perServing', { size: servingSize })}</p>}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {nutritionEntries.map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm py-1 border-b border-gray-200">
                    <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
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
