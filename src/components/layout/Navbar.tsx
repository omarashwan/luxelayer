import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { fetchSearchSuggestions } from '../../lib/api';
import type { Category, Product } from '../../types';
import { classNames, formatPrice, effectivePrice } from '../../lib/utils';

interface NavbarProps {
  categories: Category[];
}

export function Navbar({ categories }: NavbarProps) {
  const { itemCount, openCart } = useCart();
  const { profile, signOut } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [megaCat, setMegaCat] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await fetchSearchSuggestions(q, 6);
        setResults(r);
      } catch {
        setResults([]);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  const featuredCats = categories.filter((c) => c.featured).slice(0, 10);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-ink-900 text-warmwhite">
        <div className="container-luxe flex h-9 items-center justify-center gap-2 text-[11px] font-medium tracking-wide">
          <Sparkles className="h-3 w-3 text-champagne-300" />
          <span>Complimentary shipping on orders over $75 · Free samples with every order</span>
        </div>
      </div>

      <header
        className={classNames(
          'sticky top-0 z-50 transition-all duration-500',
          scrolled ? 'glass shadow-luxe-sm' : 'bg-ivory/95 backdrop-blur-sm',
        )}
      >
        <div className="container-luxe">
          <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
            {/* Left: mobile menu + nav */}
            <div className="flex items-center gap-3 lg:gap-8">
              <button
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 text-ink-800" />
              </button>
              <nav className="hidden lg:flex items-center gap-7">
                <button
                  className="group flex items-center gap-1 text-sm font-medium text-ink-700 transition hover:text-ink-900"
                  onMouseEnter={() => setMegaCat('shop')}
                  onMouseLeave={() => setMegaCat(null)}
                >
                  Shop
                  <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />
                </button>
                <Link to="/shop?sort=bestselling" className="text-sm font-medium text-ink-700 transition hover:text-ink-900">
                  Bestsellers
                </Link>
                <Link to="/shop?sort=newest" className="text-sm font-medium text-ink-700 transition hover:text-ink-900">
                  New Arrivals
                </Link>
                <Link to="/brands" className="text-sm font-medium text-ink-700 transition hover:text-ink-900">
                  Brands
                </Link>
                <Link to="/journal" className="text-sm font-medium text-ink-700 transition hover:text-ink-900">
                  Journal
                </Link>
              </nav>
            </div>

            {/* Center: logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 text-center">
              <span className="font-display text-2xl font-semibold tracking-tight text-ink-900 lg:text-3xl">
                Luxe<span className="text-gradient-gold">Layer</span>
              </span>
            </Link>

            {/* Right: actions */}
            <div className="flex items-center gap-1 sm:gap-3">
              <button
                onClick={() => setSearchOpen((s) => !s)}
                aria-label="Search"
                className="rounded-full p-2 text-ink-700 transition hover:bg-ink-100"
              >
                <Search className="h-5 w-5" />
              </button>

              <Link
                to="/account?tab=wishlist"
                aria-label="Wishlist"
                className="relative hidden sm:flex rounded-full p-2 text-ink-700 transition hover:bg-ink-100"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-warmwhite">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* User */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => (profile ? setUserMenuOpen((o) => !o) : navigate('/auth'))}
                  aria-label="Account"
                  className="rounded-full p-2 text-ink-700 transition hover:bg-ink-100"
                >
                  <User className="h-5 w-5" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && profile && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-warmwhite p-2 shadow-luxe-lg ring-1 ring-ink-100"
                    >
                      <div className="px-3 py-2.5">
                        <p className="text-sm font-medium text-ink-900">
                          {profile.first_name} {profile.last_name}
                        </p>
                        <p className="truncate text-xs text-ink-500">{profile.email}</p>
                      </div>
                      <div className="my-1 h-px bg-ink-100" />
                      {[
                        { label: 'My Orders', to: '/account?tab=orders' },
                        { label: 'Wishlist', to: '/account?tab=wishlist' },
                        { label: 'Addresses', to: '/account?tab=addresses' },
                        { label: 'Settings', to: '/account?tab=settings' },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          to={item.to}
                          className="block rounded-lg px-3 py-2 text-sm text-ink-700 transition hover:bg-ink-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                      {profile.is_admin && (
                        <Link
                          to="/admin"
                          className="block rounded-lg px-3 py-2 text-sm font-medium text-champagne-700 transition hover:bg-champagne-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <div className="my-1 h-px bg-ink-100" />
                      <button
                        onClick={() => {
                          signOut();
                          setUserMenuOpen(false);
                          navigate('/');
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink-700 transition hover:bg-ink-100"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <button
                onClick={openCart}
                aria-label="Open cart"
                className="relative rounded-full p-2 text-ink-700 transition hover:bg-ink-100"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne-500 px-1 text-[10px] font-semibold text-ink-900">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mega menu */}
        <AnimatePresence>
          {megaCat === 'shop' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-x-0 top-full hidden lg:block"
              onMouseEnter={() => setMegaCat('shop')}
              onMouseLeave={() => setMegaCat(null)}
            >
              <div className="glass border-t border-ink-100 shadow-luxe">
                <div className="container-luxe py-8">
                  <div className="grid grid-cols-5 gap-4">
                    {featuredCats.map((c) => (
                      <Link
                        key={c.id}
                        to={`/shop?category=${c.slug}`}
                        className="group flex flex-col items-start gap-3"
                      >
                        <div className="aspect-square w-full overflow-hidden rounded-2xl bg-cream">
                          <img
                            src={c.image_url ?? ''}
                            alt={c.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                        <span className="text-sm font-medium text-ink-800 transition group-hover:text-champagne-700">
                          {c.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-ink-100 pt-5">
                    <Link to="/shop" className="text-sm font-medium text-ink-800 link-underline">
                      View all products
                    </Link>
                    <Link to="/brands" className="text-sm font-medium text-ink-800 link-underline">
                      Shop by brand
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink-900/30 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              ref={searchBoxRef}
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-24 w-full max-w-2xl px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="overflow-hidden rounded-2xl bg-warmwhite shadow-luxe-lg ring-1 ring-ink-100">
                <form onSubmit={onSearchSubmit} className="flex items-center gap-3 border-b border-ink-100 px-5 py-4">
                  <Search className="h-5 w-5 text-ink-400" />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products, brands, shades…"
                    className="flex-1 bg-transparent text-base text-ink-900 placeholder:text-ink-400 focus:outline-none"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} className="text-ink-400 hover:text-ink-700">
                    <X className="h-5 w-5" />
                  </button>
                </form>
                <div className="max-h-96 overflow-y-auto">
                  {results.length === 0 && query && (
                    <p className="px-5 py-8 text-center text-sm text-ink-500">No results for "{query}"</p>
                  )}
                  {results.length === 0 && !query && (
                    <div className="px-5 py-6">
                      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-400">Popular searches</p>
                      <div className="flex flex-wrap gap-2">
                        {['Lipstick', 'Foundation', 'Mascara', 'Highlighter', 'Perfume', 'Skincare'].map((t) => (
                          <button
                            key={t}
                            onClick={() => setQuery(t)}
                            className="rounded-full bg-cream px-3 py-1.5 text-xs text-ink-700 transition hover:bg-blush-100"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {results.map((p) => {
                    const price = effectivePrice(p.price, p.sale_price);
                    return (
                      <Link
                        key={p.id}
                        to={`/product/${p.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-4 px-5 py-3 transition hover:bg-cream"
                      >
                        <img
                          src={p.featured_image_url ?? ''}
                          alt={p.name}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-ink-900">{p.name}</p>
                          {p.brand?.name && (
                            <p className="text-xs text-champagne-600">{p.brand.name}</p>
                          )}
                        </div>
                        <span className="font-display text-sm text-ink-900">{formatPrice(price)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-ink-900/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-[88%] max-w-sm overflow-y-auto bg-warmwhite p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-semibold">
                  Luxe<span className="text-gradient-gold">Layer</span>
                </span>
                <button onClick={() => setMobileOpen(false)} className="rounded-full p-2 hover:bg-ink-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-6 space-y-1">
                <Link to="/shop" className="block rounded-xl px-4 py-3 text-base font-medium text-ink-900 hover:bg-cream">
                  Shop All
                </Link>
                <Link to="/shop?sort=bestselling" className="block rounded-xl px-4 py-3 text-base text-ink-700 hover:bg-cream">
                  Bestsellers
                </Link>
                <Link to="/shop?sort=newest" className="block rounded-xl px-4 py-3 text-base text-ink-700 hover:bg-cream">
                  New Arrivals
                </Link>
                <Link to="/brands" className="block rounded-xl px-4 py-3 text-base text-ink-700 hover:bg-cream">
                  Brands
                </Link>
                <Link to="/journal" className="block rounded-xl px-4 py-3 text-base text-ink-700 hover:bg-cream">
                  Journal
                </Link>
              </nav>
              <div className="my-4 h-px bg-ink-100" />
              <p className="px-4 text-xs font-medium uppercase tracking-wider text-ink-400">Categories</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {categories.slice(0, 12).map((c) => (
                  <Link
                    key={c.id}
                    to={`/shop?category=${c.slug}`}
                    className="flex items-center gap-2 rounded-xl bg-cream px-3 py-2.5 text-sm text-ink-800"
                  >
                    <img src={c.image_url ?? ''} alt="" className="h-8 w-8 rounded-lg object-cover" />
                    {c.name}
                  </Link>
                ))}
              </div>
              <div className="my-4 h-px bg-ink-100" />
              {profile ? (
                <div className="space-y-1">
                  <Link to="/account" className="block rounded-xl px-4 py-3 text-base text-ink-700 hover:bg-cream">
                    My Account
                  </Link>
                  {profile.is_admin && (
                    <Link to="/admin" className="block rounded-xl px-4 py-3 text-base font-medium text-champagne-700 hover:bg-champagne-50">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setMobileOpen(false);
                      navigate('/');
                    }}
                    className="block w-full rounded-xl px-4 py-3 text-left text-base text-ink-700 hover:bg-cream"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="block rounded-full bg-ink-900 px-4 py-3 text-center text-sm font-medium text-warmwhite">
                  Sign In / Register
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
