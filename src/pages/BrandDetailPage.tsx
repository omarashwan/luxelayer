import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { fetchBrandBySlug, fetchProducts } from '../models/api';
import type { Brand, Product } from '../types';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';

export function BrandDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    (async () => {
      const b = await fetchBrandBySlug(slug);
      setBrand(b);
      if (b) {
        const { products } = await fetchProducts({ brand: b.slug, limit: 24 });
        setProducts(products);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (!loading && !brand) {
    return (
      <div className="container-luxe flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="font-display text-3xl text-ink-900">Brand not found</p>
        <Link to="/brands" className="btn-primary mt-6">Back to Brands</Link>
      </div>
    );
  }

  return (
    <div className="bg-ivory">
      {brand && (
        <div className="relative h-[40vh] min-h-[320px] overflow-hidden">
          <img src={brand.banner_url ?? ''} alt={brand.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/30 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="container-luxe pb-10">
              <nav className="mb-4 flex items-center gap-1.5 text-xs text-warmwhite/80">
                <Link to="/" className="flex items-center gap-1 hover:text-warmwhite"><Home className="h-3 w-3" />Home</Link>
                <span>/</span>
                <Link to="/brands" className="hover:text-warmwhite">Brands</Link>
                <span>/</span>
                <span className="text-warmwhite">{brand.name}</span>
              </nav>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-display-lg font-medium text-warmwhite"
              >
                {brand.name}
              </motion.h1>
              {brand.country && <p className="mt-1 text-sm uppercase tracking-wider text-warmwhite/80">{brand.country}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="container-luxe py-12">
        {brand?.description && (
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="font-serif text-lg font-light leading-relaxed text-ink-700">{brand.description}</p>
          </div>
        )}

        <div className="mb-6 flex items-center gap-3">
          <Link to="/brands" className="flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900">
            <ArrowLeft className="h-4 w-4" /> All brands
          </Link>
          <span className="text-ink-300">·</span>
          <h2 className="font-display text-xl font-medium text-ink-900">Products</h2>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <p className="text-sm text-ink-500">No products from this brand yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
