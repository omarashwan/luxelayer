import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Category } from '../../types';

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const featured = categories.filter((c) => c.featured).slice(0, 10);

  return (
    <section className="container-luxe py-20 lg:py-28">
      <div className="mb-12 flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="eyebrow"
        >
          Explore by Category
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mt-3 font-display text-display-md font-medium text-ink-900"
        >
          The Beauty Atelier
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 max-w-xl text-sm text-ink-600"
        >
          From sculpted complexion to couture color — discover curated edits for every step of your ritual.
        </motion.p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
        {featured.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: Math.min(i * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
            className={i === 0 || i === 5 ? 'col-span-2 sm:col-span-1' : ''}
          >
            <Link
              to={`/shop?category=${cat.slug}`}
              className="group relative block aspect-[3/4] overflow-hidden rounded-3xl bg-cream shadow-luxe-sm"
            >
              <img
                src={cat.image_url ?? ''}
                alt={cat.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1100ms] ease-luxe group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-display text-base font-medium text-warmwhite transition group-hover:translate-x-1">
                  {cat.name}
                </h3>
                <p className="mt-0.5 text-xs text-warmwhite/80 opacity-0 transition group-hover:opacity-100">
                  Shop now →
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
