import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Home } from 'lucide-react';
import { Reveal } from '../components/ui/Reveal';

const POSTS = [
  {
    slug: 'the-pillow-talk-lip',
    title: 'The Pillow Talk Lip: A Three-Step Ritual',
    excerpt: 'How to achieve the perfect my-lips-but-better nude that lasts from morning to midnight.',
    image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Lips',
    author: 'The LuxeLayer Editors',
  },
  {
    slug: 'sculpted-not-painted',
    title: 'Sculpted, Not Painted: The Art of Natural Contour',
    excerpt: 'A makeup artist’s guide to lifting and defining with cream and powder contours.',
    image: 'https://images.pexels.com/photos/3373747/pexels-photo-3373747.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Face',
    author: 'Sofia D., Makeup Artist',
  },
  {
    slug: 'the-glass-skin-secret',
    title: 'The Glass Skin Secret: Layering for Glow',
    excerpt: 'Hyaluronic acid, vitamin C, and luminizers — the order matters. Here’s the formula.',
    image: 'https://images.pexels.com/photos/3735619/pexels-photo-3735619.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Skincare',
    author: 'Nina P., Esthetician',
  },
  {
    slug: 'the-fragrance-wardrobe',
    title: 'Building Your Fragrance Wardrobe',
    excerpt: 'Why every woman needs three scents — and how to choose them for your skin.',
    image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Fragrance',
    author: 'Claire D., Perfumer',
  },
  {
    slug: 'the-perfect-base',
    title: 'The Perfect Base: Primer, Foundation, Powder',
    excerpt: 'The three-product formula for a flawless, 16-hour complexion.',
    image: 'https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Face',
    author: 'The LuxeLayer Editors',
  },
  {
    slug: 'eye-makeup-101',
    title: 'Eye Makeup 101: From Day to Dramatic',
    excerpt: 'Six looks, one palette — a complete guide to eye makeup for any occasion.',
    image: 'https://images.pexels.com/photos/2536968/pexels-photo-2536968.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Eyes',
    author: 'Maya J., Makeup Artist',
  },
];

export function JournalPage() {
  return (
    <div className="bg-ivory">
      <div className="border-b border-ink-100 bg-warmwhite">
        <div className="container-luxe py-10">
          <nav className="flex items-center gap-1.5 text-xs text-ink-500">
            <Link to="/" className="flex items-center gap-1 hover:text-ink-800"><Home className="h-3 w-3" />Home</Link>
            <span>/</span>
            <span className="text-ink-800">Journal</span>
          </nav>
          <Reveal>
            <h1 className="mt-4 font-display text-display-lg font-medium text-ink-900">The Beauty Journal</h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-3 max-w-2xl text-sm text-ink-600">
              Expert guides, rituals, and stories from the world of luxury beauty.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="container-luxe py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: Math.min(i * 0.08, 0.4) }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-cream shadow-luxe-sm transition group-hover:shadow-luxe-lg">
                <img
                  src={post.image}
                  alt={post.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1100ms] ease-luxe group-hover:scale-110"
                />
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-champagne-600">{post.category}</p>
              <h2 className="mt-2 font-display text-xl font-medium text-ink-900 transition group-hover:text-champagne-700">
                {post.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{post.excerpt}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-ink-500">{post.author}</span>
                <span className="flex items-center gap-1 text-sm font-medium text-ink-800 link-underline">
                  Read
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
