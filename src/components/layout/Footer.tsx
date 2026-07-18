import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { subscribeNewsletter } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const { error } = await subscribeNewsletter(email.trim());
    if (error) {
      toast(error, 'error');
    } else {
      toast('Welcome to the inner circle. Check your inbox.');
      setEmail('');
    }
  };

  const sections = [
    {
      title: 'Shop',
      links: [
        { label: 'All Products', to: '/shop' },
        { label: 'Bestsellers', to: '/shop?sort=bestselling' },
        { label: 'New Arrivals', to: '/shop?sort=newest' },
        { label: 'Skincare', to: '/shop?category=skincare' },
        { label: 'Perfume', to: '/shop?category=perfume' },
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'Sign In', to: '/auth' },
        { label: 'My Orders', to: '/account?tab=orders' },
        { label: 'Wishlist', to: '/account?tab=wishlist' },
        { label: 'Addresses', to: '/account?tab=addresses' },
        { label: 'Admin', to: '/admin' },
      ],
    },
    {
      title: 'Client Care',
      links: [
        { label: 'Contact Us', to: '/contact' },
        { label: 'Shipping & Returns', to: '/shipping' },
        { label: 'FAQs', to: '/faq' },
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Terms of Service', to: '/terms' },
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-ink-100 bg-cream">
      {/* Newsletter strip */}
      <div className="border-b border-ink-100">
        <div className="container-luxe py-14">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="eyebrow">The Inner Circle</p>
              <h2 className="mt-3 font-display text-3xl text-ink-900 lg:text-4xl">
                Join for early access & beauty edits
              </h2>
              <p className="mt-3 max-w-md text-sm text-ink-600">
                Be the first to shop new launches, exclusive collaborations, and members-only offers — straight to your inbox.
              </p>
            </div>
            <form onSubmit={onSubscribe} className="flex w-full max-w-md gap-2 lg:ml-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-luxe flex-1"
                required
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-luxe py-16">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="font-display text-3xl font-semibold">
              Luxe<span className="text-gradient-gold">Layer</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-600">
              A considered edit of the world's finest beauty — luxury cosmetics, skincare and fragrance,
              sourced directly from the houses that make them.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a href="#" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full bg-warmwhite text-ink-700 ring-1 ring-ink-100 transition hover:bg-ink-900 hover:text-warmwhite">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="mailto:clientcare@luxelayer.com" aria-label="Email" className="flex h-10 w-10 items-center justify-center rounded-full bg-warmwhite text-ink-700 ring-1 ring-ink-100 transition hover:bg-ink-900 hover:text-warmwhite">
                <Mail className="h-4 w-4" />
              </a>
              <a href="tel:+18005839529" aria-label="Phone" className="flex h-10 w-10 items-center justify-center rounded-full bg-warmwhite text-ink-700 ring-1 ring-ink-100 transition hover:bg-ink-900 hover:text-warmwhite">
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>
          {sections.map((s) => (
            <div key={s.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">{s.title}</h3>
              <ul className="mt-4 space-y-3">
                {s.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-ink-700 transition hover:text-champagne-700 link-underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-200 pt-8 text-xs text-ink-500 sm:flex-row">
          <p>© {new Date().getFullYear()} LuxeLayer Beauty. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span>Secure Checkout</span>
            <span>·</span>
            <span>Authenticity Guaranteed</span>
            <span>·</span>
            <span>Cruelty-Conscious</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
