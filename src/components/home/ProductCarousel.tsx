import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import type { Product } from '../../types';
import { ProductCard } from '../ui/ProductCard';
import { Reveal } from '../ui/Reveal';

interface ProductCarouselProps {
  title: string;
  eyebrow: string;
  products: Product[];
  viewAllLink?: string;
  accent?: 'gold' | 'rose';
}

export function ProductCarousel({ title, eyebrow, products, viewAllLink = '/shop', accent = 'gold' }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (products.length === 0) return null;

  return (
    <section className="container-luxe py-16 lg:py-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <Reveal>
            <span className={accent === 'gold' ? 'eyebrow' : 'eyebrow text-rose-500'}>{eyebrow}</span>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mt-3 font-display text-display-md font-medium text-ink-900">{title}</h2>
          </Reveal>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition hover:border-ink-900 hover:bg-ink-900 hover:text-warmwhite sm:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition hover:border-ink-900 hover:bg-ink-900 hover:text-warmwhite sm:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <Link
            to={viewAllLink}
            className="ml-2 hidden items-center gap-1 text-sm font-medium text-ink-800 link-underline sm:flex"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 no-scrollbar mask-fade-r sm:mx-0 sm:px-0"
      >
        {products.map((p, i) => (
          <div
            key={p.id}
            className="w-[78%] shrink-0 snap-start sm:w-[44%] md:w-[30%] lg:w-[23%] xl:w-[18.5%]"
          >
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link to={viewAllLink} className="btn-outline">
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
