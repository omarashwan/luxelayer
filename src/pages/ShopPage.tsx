import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Check, Home } from 'lucide-react';
import { fetchBrands, fetchCategories, fetchProducts } from '../models/api';
import type { Brand, Category, Product } from '../types';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { classNames } from '../models/utils';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'bestselling', label: 'Best Selling' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-asc', label: 'Lowest Price' },
  { value: 'price-desc', label: 'Highest Price' },
];

export function ShopPage() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category');
  const brand = params.get('brand');
  const search = params.get('search');
  const sort = params.get('sort') ?? 'featured';
  const minPrice = params.get('minPrice');
  const maxPrice = params.get('maxPrice');
  const minRating = params.get('minRating');
  const inStockOnly = params.get('inStock') === '1';

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 24;

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
    fetchBrands().then(setBrands).catch(() => setBrands([]));
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { products: p, total: t } = await fetchProducts({
        category,
        brand,
        search,
        sort,
        minPrice: minPrice ? Number(minPrice) : null,
        maxPrice: maxPrice ? Number(maxPrice) : null,
        minRating: minRating ? Number(minRating) : null,
        inStockOnly,
        page,
        limit: pageSize,
      });
      setProducts(p);
      setTotal(t);
    } catch (err) {
      console.error('Shop load error', err);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [category, brand, search, sort, minPrice, maxPrice, minRating, inStockOnly, page]);

  useEffect(() => {
    setPage(1);
  }, [category, brand, search, sort, minPrice, maxPrice, minRating, inStockOnly]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    setParams(next);
  };

  const clearFilters = () => {
    setParams(new URLSearchParams());
  };

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (category) n++;
    if (brand) n++;
    if (minPrice) n++;
    if (maxPrice) n++;
    if (minRating) n++;
    if (inStockOnly) n++;
    return n;
  }, [category, brand, minPrice, maxPrice, minRating, inStockOnly]);

  const activeCategory = categories.find((c) => c.slug === category);
  const activeBrand = brands.find((b) => b.slug === brand);
  const totalPages = Math.ceil(total / pageSize);

  const FilterPanel = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Category</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam('category', null)}
            className={classNames(
              'block w-full rounded-lg px-3 py-2 text-left text-sm transition',
              !category ? 'bg-ink-900 text-warmwhite' : 'text-ink-700 hover:bg-cream',
            )}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => updateParam('category', c.slug)}
              className={classNames(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition',
                category === c.slug ? 'bg-ink-900 text-warmwhite' : 'text-ink-700 hover:bg-cream',
              )}
            >
              {c.name}
              {category === c.slug && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Brand</h3>
        <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
          <button
            onClick={() => updateParam('brand', null)}
            className={classNames(
              'block w-full rounded-lg px-3 py-2 text-left text-sm transition',
              !brand ? 'bg-ink-900 text-warmwhite' : 'text-ink-700 hover:bg-cream',
            )}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => updateParam('brand', b.slug)}
              className={classNames(
                'block w-full rounded-lg px-3 py-2 text-left text-sm transition',
                brand === b.slug ? 'bg-ink-900 text-warmwhite' : 'text-ink-700 hover:bg-cream',
              )}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={minPrice ?? ''}
            onBlur={(e) => updateParam('minPrice', e.target.value || null)}
            className="input-luxe h-10 text-sm"
          />
          <span className="text-ink-400">—</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={maxPrice ?? ''}
            onBlur={(e) => updateParam('maxPrice', e.target.value || null)}
            className="input-luxe h-10 text-sm"
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Rating</h3>
        <div className="space-y-1.5">
          {[null, '4', '4.5', '4.8'].map((r) => (
            <button
              key={r ?? 'all'}
              onClick={() => updateParam('minRating', r)}
              className={classNames(
                'block w-full rounded-lg px-3 py-2 text-left text-sm transition',
                (minRating ?? null) === r ? 'bg-ink-900 text-warmwhite' : 'text-ink-700 hover:bg-cream',
              )}
            >
              {r === null ? 'All Ratings' : `${r}★ & up`}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Availability</h3>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-cream">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => updateParam('inStock', e.target.checked ? '1' : null)}
            className="peer sr-only"
          />
          <span className="flex h-5 w-5 items-center justify-center rounded-md border border-ink-300 transition peer-checked:border-champagne-500 peer-checked:bg-champagne-500">
            {inStockOnly && <Check className="h-3 w-3 text-warmwhite" />}
          </span>
          <span className="text-sm text-ink-700">In stock only</span>
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="btn-ghost w-full text-sm">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory">
      {/* Breadcrumb + title */}
      <div className="border-b border-ink-100 bg-warmwhite">
        <div className="container-luxe py-8">
          <nav className="flex items-center gap-1.5 text-xs text-ink-500">
            <Link to="/" className="flex items-center gap-1 hover:text-ink-800">
              <Home className="h-3 w-3" />
              Home
            </Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-ink-800">Shop</Link>
            {activeCategory && (
              <>
                <span>/</span>
                <span className="text-ink-800">{activeCategory.name}</span>
              </>
            )}
            {activeBrand && (
              <>
                <span>/</span>
                <span className="text-ink-800">{activeBrand.name}</span>
              </>
            )}
          </nav>
          <h1 className="mt-4 font-display text-display-md font-medium text-ink-900">
            {search ? `Results for "${search}"` : activeCategory?.name ?? activeBrand?.name ?? 'All Products'}
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            {total} {total === 1 ? 'product' : 'products'}
            {activeCategory?.description && ` · ${activeCategory.description}`}
          </p>
        </div>
      </div>

      <div className="container-luxe py-8">
        <div className="flex gap-8">
          {/* Sidebar (desktop) */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-28">
              <FilterPanel />
            </div>
          </aside>

          {/* Main */}
          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex items-center justify-between gap-3">
              <button
                onClick={() => setFilterOpen(true)}
                className="flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-sm font-medium text-ink-800 lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink-900 text-[10px] text-warmwhite">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="relative ml-auto">
                <select
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="appearance-none rounded-full border border-ink-200 bg-warmwhite py-2.5 pl-4 pr-10 text-sm font-medium text-ink-800 focus:border-champagne-400 focus:outline-none"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      Sort: {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {category && (
                  <Chip label={activeCategory?.name ?? category} onRemove={() => updateParam('category', null)} />
                )}
                {brand && (
                  <Chip label={activeBrand?.name ?? brand} onRemove={() => updateParam('brand', null)} />
                )}
                {minPrice && <Chip label={`Min $${minPrice}`} onRemove={() => updateParam('minPrice', null)} />}
                {maxPrice && <Chip label={`Max $${maxPrice}`} onRemove={() => updateParam('maxPrice', null)} />}
                {minRating && <Chip label={`${minRating}★+`} onRemove={() => updateParam('minRating', null)} />}
                {inStockOnly && <Chip label="In stock" onRemove={() => updateParam('inStock', null)} />}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cream">
                  <SlidersHorizontal className="h-8 w-8 text-ink-400" />
                </div>
                <p className="mt-4 font-display text-xl text-ink-900">No products found</p>
                <p className="mt-1 text-sm text-ink-500">Try adjusting your filters or search.</p>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="btn-outline mt-5">
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition hover:bg-ink-900 hover:text-warmwhite disabled:opacity-40"
                >
                  ←
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                  const num = i + 1;
                  return (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={classNames(
                        'flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium transition',
                        page === num ? 'bg-ink-900 text-warmwhite' : 'border border-ink-200 text-ink-700 hover:bg-cream',
                      )}
                    >
                      {num}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition hover:bg-ink-900 hover:text-warmwhite disabled:opacity-40"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-ink-900/40 lg:hidden"
            onClick={() => setFilterOpen(false)}
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-warmwhite p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-xl font-medium">Filters</h2>
                <button onClick={() => setFilterOpen(false)} className="rounded-full p-2 hover:bg-ink-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterPanel />
              <button onClick={() => setFilterOpen(false)} className="btn-primary mt-6 w-full">
                Show {total} results
              </button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 text-xs font-medium text-warmwhite">
      {label}
      <button onClick={onRemove} className="transition hover:text-champagne-300">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
