import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Brand } from '../../types';
import { Reveal } from '../ui/Reveal';

export function BrandStrip({ brands }: { brands: Brand[] }) {
  const featured = brands.filter((b) => b.featured).slice(0, 10);
  if (featured.length === 0) return null;

  return (
    <section className="border-y border-ink-100 bg-warmwhite py-12">
      <div className="container-luxe">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <Reveal>
              <span className="eyebrow">The Houses</span>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="mt-2 font-display text-2xl font-medium text-ink-900 lg:text-3xl">
                Curated Luxury Brands
              </h2>
            </Reveal>
          </div>
          <Link to="/brands" className="hidden text-sm font-medium text-ink-800 link-underline sm:block">
            View all brands
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
          {featured.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.3) }}
            >
              <Link
                to={`/brands/${b.slug}`}
                className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl bg-cream p-4 text-center transition hover:bg-blush-50 hover:shadow-luxe-sm"
              >
                <img
                  src={b.logo_url ?? ''}
                  alt={b.name}
                  loading="lazy"
                  className="h-12 w-12 rounded-full object-cover ring-1 ring-ink-100 transition group-hover:scale-110"
                />
                <span className="text-[11px] font-medium leading-tight text-ink-700">{b.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
