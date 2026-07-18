import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Banner } from '../../types';

export function Hero({ banners }: { banners: Banner[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  const hero = banners.find((b) => b.placement === 'hero') ?? banners[0];

  return (
    <section ref={ref} className="relative h-[92vh] min-h-[640px] w-full overflow-hidden bg-cream">
      {/* Parallax background */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img
          src={hero?.image_url ?? 'https://images.pexels.com/photos/3373738/pexels-photo-3373738.jpeg?auto=compress&cs=tinysrgb&w=1800'}
          alt={hero?.title ?? 'Luxury beauty'}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/60 via-ink-900/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 via-transparent to-transparent" />
      </motion.div>

      {/* Floating shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-champagne-200/30 blur-3xl animate-float-slow" />
        <div className="absolute right-10 top-1/3 h-60 w-60 rounded-full bg-blush-200/30 blur-3xl animate-float" />
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex h-full items-center"
      >
        <div className="container-luxe">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5 inline-flex items-center gap-2 rounded-full bg-warmwhite/15 px-4 py-2 backdrop-blur-md ring-1 ring-white/30"
            >
              <Sparkles className="h-3.5 w-3.5 text-champagne-300" />
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-warmwhite">
                The Autumn Edit
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-display-xl font-medium text-warmwhite"
            >
              {hero?.title ?? 'The Lip Edit'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 max-w-lg font-serif text-lg font-light leading-relaxed text-warmwhite/90 sm:text-xl"
            >
              {hero?.subtitle ?? 'Plush glosses & velvety mattes in this season’s most coveted nude and berry tones.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link to={hero?.cta_link ?? '/shop'} className="btn-gold group">
                {hero?.cta_label ?? 'Shop Now'}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/shop?sort=newest"
                className="btn-luxe border border-white/40 bg-white/10 text-warmwhite backdrop-blur-md hover:bg-white/20"
              >
                Featured Collection
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/50 p-1.5">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="h-2 w-1 rounded-full bg-white"
          />
        </div>
      </motion.div>
    </section>
  );
}
