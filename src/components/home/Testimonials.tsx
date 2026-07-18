import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import type { Testimonial } from '../../types';
import { Reveal } from '../ui/Reveal';

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-luxury-gradient py-20 lg:py-28">
      <div className="container-luxe">
        <div className="mb-12 flex flex-col items-center text-center">
          <Reveal>
            <span className="eyebrow">Loved by Thousands</span>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mt-3 font-display text-display-md font-medium text-ink-900">
              The LuxeLayer Client
            </h2>
          </Reveal>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: Math.min(i * 0.08, 0.4), ease: [0.22, 1, 0.36, 1] }}
              className="card-luxe p-7"
            >
              <Quote className="h-7 w-7 text-champagne-400" />
              <p className="mt-4 font-serif text-base leading-relaxed text-ink-800">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} className="h-3.5 w-3.5 fill-champagne-400 text-champagne-400" />
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 border-t border-ink-100 pt-4">
                <img
                  src={t.avatar_url ?? ''}
                  alt={t.author_name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-ink-900">{t.author_name}</p>
                  {t.author_title && <p className="text-xs text-ink-500">{t.author_title}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
