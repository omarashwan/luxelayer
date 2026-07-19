import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { fetchBrands } from '../models/api';
import type { Brand } from '../types';
import { Reveal } from '../components/ui/Reveal';
import { Skeleton } from '../components/ui/Skeleton';

export function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands()
      .then(setBrands)
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-ivory">
      <div className="border-b border-ink-100 bg-warmwhite">
        <div className="container-luxe py-10">
          <nav className="flex items-center gap-1.5 text-xs text-ink-500">
            <Link to="/" className="flex items-center gap-1 hover:text-ink-800"><Home className="h-3 w-3" />Home</Link>
            <span>/</span>
            <span className="text-ink-800">Brands</span>
          </nav>
          <Reveal>
            <h1 className="mt-4 font-display text-display-lg font-medium text-ink-900">The Houses We Love</h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-3 max-w-2xl text-sm text-ink-600">
              An edited selection of the world's most coveted beauty houses — from heritage maisons to modern icons.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="container-luxe py-12">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[16/9]" rounded="2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: Math.min(i * 0.05, 0.4) }}
              >
                <Link
                  to={`/brands/${b.slug}`}
                  className="group relative block aspect-[16/10] overflow-hidden rounded-3xl bg-cream shadow-luxe-sm transition hover:shadow-luxe-lg"
                >
                  <img
                    src={b.banner_url ?? b.logo_url ?? ''}
                    alt={b.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1100ms] ease-luxe group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-display text-2xl font-medium text-warmwhite">{b.name}</h3>
                    {b.country && <p className="mt-0.5 text-xs uppercase tracking-wider text-warmwhite/80">{b.country}</p>}
                    {b.description && <p className="mt-2 line-clamp-2 text-sm text-warmwhite/85">{b.description}</p>}
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-champagne-300 transition group-hover:gap-2">
                      Explore →
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
