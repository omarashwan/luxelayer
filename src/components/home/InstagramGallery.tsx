import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Reveal } from '../ui/Reveal';

const INSTAGRAM_IMAGES = [
  'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3373738/pexels-photo-3373738.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2533265/pexels-photo-2533265.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2536968/pexels-photo-2536968.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=600',
];

export function InstagramGallery() {
  return (
    <section className="container-luxe py-20">
      <div className="mb-10 flex flex-col items-center text-center">
        <Reveal>
          <span className="eyebrow flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            @LuxeLayer
          </span>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="mt-3 font-display text-display-md font-medium text-ink-900">
            Follow the Ritual
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-3 max-w-md text-sm text-ink-600">
            Tag us in your LuxeLayer moments for a chance to be featured.
          </p>
        </Reveal>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6 md:gap-3">
        {INSTAGRAM_IMAGES.map((src, i) => (
          <motion.a
            key={src}
            href="#"
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.3) }}
            className="group relative aspect-square overflow-hidden rounded-2xl bg-cream"
          >
            <img
              src={src}
              alt="Instagram"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-ink-900/0 transition group-hover:bg-ink-900/40">
              <ArrowUpRight className="h-6 w-6 text-warmwhite opacity-0 transition group-hover:opacity-100" />
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
