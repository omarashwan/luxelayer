import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Banner } from '../../types';
import { Reveal } from '../ui/Reveal';

export function EditorialBanners({ banners }: { banners: Banner[] }) {
  const editorial = banners.filter((b) => b.placement === 'editorial').slice(0, 2);
  if (editorial.length === 0) return null;

  return (
    <section className="container-luxe py-12">
      <div className="grid gap-5 lg:grid-cols-2">
        {editorial.map((b, i) => (
          <Reveal key={b.id} delay={i * 120}>
            <Link
              to={b.cta_link ?? '/shop'}
              className="group relative block aspect-[16/10] overflow-hidden rounded-4xl bg-cream shadow-luxe"
            >
              <img
                src={b.image_url ?? ''}
                alt={b.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-luxe group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink-900/60 via-ink-900/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-10">
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="max-w-sm font-display text-3xl font-medium text-warmwhite lg:text-4xl"
                >
                  {b.title}
                </motion.h3>
                {b.subtitle && (
                  <p className="mt-2 max-w-sm text-sm text-warmwhite/85 lg:text-base">{b.subtitle}</p>
                )}
                <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-warmwhite/95 px-5 py-2.5 text-sm font-medium text-ink-900 transition group-hover:gap-3">
                  {b.cta_label ?? 'Shop Now'}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
