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
    products,
    categories,
    activeCategory,
    setActiveCategory,
    search,
    setSearch,
    addedId,
    handleAddToCart,
    isCustomer,
  } = useProductCatalog();

  const filterOptions = [
    { key: '', label: t('home.allCategories'), color: '#16a34a' },
    ...categories.map((cat) => ({
      key: cat,
      label: t(`categories.${cat}`),
      color: CATEGORY_COLORS[cat],
    })),
  ];

  return (
    <main>
      <section className="mb-8 rounded-xl bg-gradient-to-br from-green-50 to-green-100 px-4 py-10 text-center">
        <h1 className="mb-2 text-3xl font-extrabold text-green-900">
          {t('home.hero')}
        </h1>
        <p className="m-0 text-lg text-green-800">{t('home.heroSub')}</p>
      </section>

      <div className="mb-4">
        <input
          type="text"
          placeholder={t('home.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="box-border w-full rounded-lg border border-gray-300 px-4 py-3 text-base"
        />
      </div>

      <div className="mb-6">
        <FilterPills
          options={filterOptions}
          active={activeCategory}
          onChange={setActiveCategory}
        />
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">{t('home.noProducts')}</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-xl border border-gray-200 transition-shadow"
            >
              <Link href={`/products/${product.id}`} className="no-underline">
                <ProductImage
                  category={product.category}
                  name={product.name}
                  imageUrl={product.image_url}
                  size="medium"
                />
              </Link>
              <div className="p-4">
                <CategoryBadge
                  category={product.category}
                  label={t(`categories.${product.category}`)}
                  colors={CATEGORY_COLORS}
                />
                <Link
                  href={`/products/${product.id}`}
                  className="mb-1 mt-2 block text-base font-semibold text-gray-900 no-underline"
                >
                  {product.name}
                </Link>
                <p className="mb-3 text-sm leading-snug text-gray-500">
                  {product.description.length > 80
                    ? product.description.slice(0, 80) + '...'
                    : product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  {isCustomer &&
                    (product.stock > 0 ? (
                      <Button
                        onClick={() => handleAddToCart(product.id)}
                        size="xs"
                        className={
                          addedId === product.id ? '!bg-green-500' : ''
                        }
                      >
                        {addedId === product.id
                          ? t('common.added')
                          : t('common.addToCart')}
                      </Button>
                    ) : (
                      <span className="text-[0.8rem] font-medium text-red-500">
                        {t('common.outOfStock')}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
