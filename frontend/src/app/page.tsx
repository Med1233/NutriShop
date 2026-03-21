'use client';

import Link from 'next/link';
import { useLanguage } from './i18n/LanguageContext';
import { useProductCatalog } from './hooks';
import { CATEGORY_COLORS } from './types';
import ProductImage from './components/ProductImage';
import { Button, FilterPills, CategoryBadge } from '@nutrishop/ui';

export default function Home() {
  const { t } = useLanguage();
  const {
    products, categories, activeCategory, setActiveCategory,
    search, setSearch, addedId, handleAddToCart, isCustomer,
  } = useProductCatalog();

  const filterOptions = [
    { key: '', label: t('home.allCategories'), color: '#16a34a' },
    ...categories.map(cat => ({ key: cat, label: t(`categories.${cat}`), color: CATEGORY_COLORS[cat] })),
  ];

  return (
    <main>
      <section className="text-center py-10 px-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl mb-8">
        <h1 className="text-3xl font-extrabold text-green-900 mb-2">{t('home.hero')}</h1>
        <p className="text-lg text-green-800 m-0">{t('home.heroSub')}</p>
      </section>

      <div className="mb-4">
        <input
          type="text"
          placeholder={t('home.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full py-3 px-4 text-base border border-gray-300 rounded-lg box-border"
        />
      </div>

      <div className="mb-6">
        <FilterPills options={filterOptions} active={activeCategory} onChange={setActiveCategory} />
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">{t('home.noProducts')}</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {products.map(product => (
            <div key={product.id} className="border border-gray-200 rounded-xl overflow-hidden transition-shadow">
              <Link href={`/products/${product.id}`} className="no-underline">
                <ProductImage category={product.category} name={product.name} imageUrl={product.image_url} size="medium" />
              </Link>
              <div className="p-4">
                <CategoryBadge category={product.category} label={t(`categories.${product.category}`)} colors={CATEGORY_COLORS} />
                <Link href={`/products/${product.id}`} className="block text-base font-semibold text-gray-900 no-underline mt-2 mb-1">{product.name}</Link>
                <p className="text-sm text-gray-500 mb-3 leading-snug">
                  {product.description.length > 80 ? product.description.slice(0, 80) + '...' : product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</span>
                  {isCustomer && (
                    product.stock > 0 ? (
                      <Button
                        onClick={() => handleAddToCart(product.id)}
                        size="xs"
                        className={addedId === product.id ? '!bg-green-500' : ''}
                      >
                        {addedId === product.id ? t('common.added') : t('common.addToCart')}
                      </Button>
                    ) : (
                      <span className="text-[0.8rem] text-red-500 font-medium">{t('common.outOfStock')}</span>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
