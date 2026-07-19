import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ChevronDown } from 'lucide-react';
import { fetchFaqs } from '../models/api';
import { Reveal } from '../components/ui/Reveal';
import { classNames } from '../models/utils';

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

export function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchFaqs().then((d) => setFaqs(d as Faq[])).catch(() => setFaqs([]));
  }, []);

  const categories = [...new Set(faqs.map((f) => f.category).filter(Boolean))] as string[];
  const filtered = category ? faqs.filter((f) => f.category === category) : faqs;

  return (
    <div className="bg-ivory">
      <div className="border-b border-ink-100 bg-warmwhite">
        <div className="container-luxe py-10">
          <nav className="flex items-center gap-1.5 text-xs text-ink-500">
            <Link to="/" className="flex items-center gap-1 hover:text-ink-800"><Home className="h-3 w-3" />Home</Link>
            <span>/</span>
            <span className="text-ink-800">FAQs</span>
          </nav>
          <Reveal>
            <h1 className="mt-4 font-display text-display-lg font-medium text-ink-900">Frequently Asked Questions</h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-3 max-w-2xl text-sm text-ink-600">
              Everything you need to know about ordering, shipping, returns, and our products.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="container-luxe py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setCategory(null)}
              className={classNames('rounded-full px-4 py-2 text-sm font-medium transition', !category ? 'bg-ink-900 text-warmwhite' : 'bg-cream text-ink-700 hover:bg-blush-100')}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={classNames('rounded-full px-4 py-2 text-sm font-medium transition', category === c ? 'bg-ink-900 text-warmwhite' : 'bg-cream text-ink-700 hover:bg-blush-100')}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((f) => {
              const isOpen = openId === f.id;
              return (
                <div key={f.id} className="overflow-hidden rounded-2xl bg-warmwhite ring-1 ring-ink-100">
                  <button
                    onClick={() => setOpenId(isOpen ? null : f.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-display text-base font-medium text-ink-900">{f.question}</span>
                    <ChevronDown className={classNames('h-5 w-5 shrink-0 text-ink-500 transition', isOpen && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-ink-600">{f.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
