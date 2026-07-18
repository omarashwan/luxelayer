import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '../ui/Reveal';

const TIPS = [
  {
    title: 'The Pillow Talk Lip',
    excerpt: 'How to achieve the perfect my-lips-but-better nude in three simple steps.',
    image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=900',
    category: 'Lips',
  },
  {
    title: 'Sculpted, Not Painted',
    excerpt: 'A makeup artist’s guide to natural contour that lifts and defines.',
    image: 'https://images.pexels.com/photos/3373747/pexels-photo-3373747.jpeg?auto=compress&cs=tinysrgb&w=900',
    category: 'Face',
  },
  {
    title: 'The Glass Skin Secret',
    excerpt: 'Layering hyaluronic acid and luminizers for an otherworldly glow.',
    image: 'https://images.pexels.com/photos/3735619/pexels-photo-3735619.jpeg?auto=compress&cs=tinysrgb&w=900',
    category: 'Skincare',
  },
];

export function BeautyTips() {
  return (
    <section className="bg-cream py-20 lg:py-28">
      <div className="container-luxe">
        <div className="mb-12 flex flex-col items-end justify-between gap-6 sm:flex-row">
          <div>
            <Reveal>
              <span className="eyebrow">Beauty Journal</span>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="mt-3 font-display text-display-md font-medium text-ink-900">
                Tips & Tutorials
              </h2>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <Link to="/journal" className="flex items-center gap-1 text-sm font-medium text-ink-800 link-underline">
              Read the journal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TIPS.map((tip, i) => (
            <motion.article
              key={tip.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-warmwhite shadow-luxe-sm">
                <img
                  src={tip.image}
                  alt={tip.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1100ms] ease-luxe group-hover:scale-110"
                />
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-champagne-600">{tip.category}</p>
              <h3 className="mt-2 font-display text-xl font-medium text-ink-900 transition group-hover:text-champagne-700">
                {tip.title}
              </h3>
              <p className="mt-2 text-sm text-ink-600">{tip.excerpt}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-ink-800 link-underline">
                Read more
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </span>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
