import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Share2,
  ShoppingBag,
  Star,
  Minus,
  Plus,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  Home,
  ZoomIn,
} from 'lucide-react';
import { fetchProductBySlug, fetchRelatedProducts, fetchReviews, createReview } from '../models/api';
import type { Product, Review, Shade, Size } from '../types';
import { useCart } from '../controllers/CartContext';
import { useWishlist } from '../controllers/WishlistContext';
import { useToast } from '../controllers/ToastContext';
import { useAuth } from '../controllers/AuthContext';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { classNames, discountPercent, effectivePrice, formatPrice, timeAgo } from '../models/utils';

const RECENTLY_VIEWED_KEY = 'luxelayer.recently_viewed.v1';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast();
  const { profile } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedShade, setSelectedShade] = useState<Shade | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'how-to-use' | 'reviews' | 'shipping'>('description');
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ open: false, rating: 5, title: '', body: '', author: '' });
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    setProduct(null);
    setActiveImage(0);
    setSelectedShade(null);
    setSelectedSize(null);
    setQuantity(1);
    setActiveTab('description');

    (async () => {
      const p = await fetchProductBySlug(slug);
      if (!p) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProduct(p);
      setSelectedShade(p.shades?.[0] ?? null);
      setSelectedSize(p.sizes?.[0] ?? null);
      setLoading(false);

      // Track recently viewed
      try {
        const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
        const arr: string[] = raw ? JSON.parse(raw) : [];
        const next = [p.id, ...arr.filter((id) => id !== p.id)].slice(0, 12);
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }

      // Related + reviews
      fetchRelatedProducts(p.id, p.category_id ?? null, 6).then(setRelated).catch(() => setRelated([]));
      fetchReviews(p.id).then(setReviews).catch(() => setReviews([]));
    })();
  }, [slug]);

  const gallery = useMemo(() => {
    if (!product) return [];
    const imgs = [product.featured_image_url, ...(product.product_images?.map((i) => i.url) ?? [])]
      .filter((u): u is string => Boolean(u));
    return [...new Set(imgs)];
  }, [product]);

  const isWished = product ? has(product.id) : false;

  const price = product ? effectivePrice(product.price, product.sale_price) : 0;
  const unitPrice = price + (selectedSize?.price_adjustment ?? 0);
  const discount = product ? discountPercent(product.price, product.sale_price) : 0;
  const outOfStock = (selectedShade?.stock ?? selectedSize?.stock ?? product?.stock ?? 0) <= 0;

  if (loading) {
    return (
      <div className="container-luxe py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <ProductCardSkeleton />
          <div className="space-y-4">
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="container-luxe flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="font-display text-3xl text-ink-900">Product not found</p>
        <p className="mt-2 text-sm text-ink-500">This product may have been moved or is no longer available.</p>
        <Link to="/shop" className="btn-primary mt-6">Back to Shop</Link>
      </div>
    );
  }

  const onAddToCart = () => {
    if (outOfStock) {
      toast('This item is out of stock', 'error');
      return;
    }
    addItem(product, { shade: selectedShade, size: selectedSize, quantity });
    toast(`${product.name} added to bag`);
  };

  const onBuyNow = () => {
    if (outOfStock) {
      toast('This item is out of stock', 'error');
      return;
    }
    addItem(product, { shade: selectedShade, size: selectedSize, quantity });
    navigate('/checkout');
  };

  const onShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast('Link copied to clipboard');
      }
    } catch {
      // ignore
    }
  };

  const onWishlist = () => {
    toggle(product);
    toast(isWished ? 'Removed from wishlist' : 'Added to wishlist', isWished ? 'info' : 'success');
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const author = reviewForm.author.trim() || profile?.first_name || 'Anonymous';
    const { error } = await createReview(product.id, author, reviewForm.rating, reviewForm.title, reviewForm.body);
    if (error) {
      toast(error, 'error');
    } else {
      toast('Review submitted — thank you');
      setReviewForm({ open: false, rating: 5, title: '', body: '', author: '' });
      fetchReviews(product.id).then(setReviews);
    }
  };

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const pct = reviews.length ? (count / reviews.length) * 100 : 0;
    return { star, count, pct };
  });

  const tabs = [
    { id: 'description' as const, label: 'Description' },
    { id: 'ingredients' as const, label: 'Ingredients' },
    { id: 'how-to-use' as const, label: 'How To Use' },
    { id: 'shipping' as const, label: 'Shipping & Returns' },
    { id: 'reviews' as const, label: `Reviews (${reviews.length})` },
  ];

  return (
    <div className="bg-ivory">
      {/* Breadcrumb */}
      <div className="border-b border-ink-100 bg-warmwhite">
        <div className="container-luxe py-4">
          <nav className="flex items-center gap-1.5 text-xs text-ink-500">
            <Link to="/" className="flex items-center gap-1 hover:text-ink-800"><Home className="h-3 w-3" />Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-ink-800">Shop</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link to={`/shop?category=${product.category.slug}`} className="hover:text-ink-800">{product.category.name}</Link>
              </>
            )}
            <span>/</span>
            <span className="truncate text-ink-800">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-luxe py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0.4, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="group relative aspect-[4/5] overflow-hidden rounded-4xl bg-cream shadow-luxe"
            >
              <img
                src={gallery[activeImage] ?? ''}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => setZoomOpen(true)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-warmwhite/80 backdrop-blur-md text-ink-800 transition hover:bg-warmwhite"
                aria-label="Zoom"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              {discount > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-ink-900 px-3 py-1.5 text-xs font-semibold text-warmwhite">
                  -{discount}%
                </span>
              )}
            </motion.div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
                {gallery.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(i)}
                    className={classNames(
                      'relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition',
                      activeImage === i ? 'ring-champagne-400' : 'ring-transparent hover:ring-ink-200',
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.brand && (
              <Link to={`/brands/${product.brand.slug}`} className="eyebrow hover:text-champagne-700">
                {product.brand.name}
              </Link>
            )}
            <h1 className="mt-2 font-display text-display-md font-medium leading-tight text-ink-900">
              {product.name}
            </h1>
            {product.short_description && (
              <p className="mt-3 font-serif text-lg font-light text-ink-700">{product.short_description}</p>
            )}

            {/* Rating */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={classNames(
                      'h-4 w-4',
                      i < Math.round(product.rating) ? 'fill-champagne-400 text-champagne-400' : 'text-ink-200',
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-ink-900">{product.rating.toFixed(1)}</span>
              <button onClick={() => setActiveTab('reviews')} className="text-sm text-ink-500 link-underline">
                {product.review_count.toLocaleString()} reviews
              </button>
            </div>

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-3xl font-medium text-ink-900">{formatPrice(unitPrice)}</span>
              {discount > 0 && (
                <span className="text-lg text-ink-400 line-through">{formatPrice(product.price)}</span>
              )}
              {discount > 0 && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Shades */}
            {product.shades && product.shades.length > 0 && (
              <div className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Shade</h3>
                  {selectedShade && <span className="text-sm text-ink-700">{selectedShade.name}</span>}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.shades.map((shade) => (
                    <button
                      key={shade.id}
                      onClick={() => setSelectedShade(shade)}
                      title={shade.name}
                      className={classNames(
                        'relative h-11 w-11 rounded-full ring-2 ring-offset-2 ring-offset-warmwhite transition',
                        selectedShade?.id === shade.id ? 'ring-champagne-500 scale-110' : 'ring-ink-200 hover:ring-ink-400',
                      )}
                      style={{ backgroundColor: shade.hex_color ?? '#eee' }}
                    >
                      {selectedShade?.id === shade.id && (
                        <Check className="absolute inset-0 m-auto h-4 w-4 text-warmwhite drop-shadow" />
                      )}
                      {shade.stock <= 0 && (
                        <span className="absolute inset-0 rounded-full bg-warmwhite/60" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Size</h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={classNames(
                        'rounded-xl border px-4 py-2.5 text-sm font-medium transition',
                        selectedSize?.id === size.id
                          ? 'border-ink-900 bg-ink-900 text-warmwhite'
                          : 'border-ink-200 text-ink-700 hover:border-ink-400',
                      )}
                    >
                      {size.name}
                      {size.price_adjustment > 0 && <span className="ml-1 text-xs opacity-70">+{formatPrice(size.price_adjustment)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + add to cart */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-ink-200">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center text-ink-700 hover:text-ink-900"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-11 w-11 items-center justify-center text-ink-700 hover:text-ink-900"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={onAddToCart}
                disabled={outOfStock}
                className="btn-primary flex-1 min-w-[180px] py-3.5"
              >
                <ShoppingBag className="h-4 w-4" />
                {outOfStock ? 'Sold Out' : 'Add to Bag'}
              </button>

              <button
                onClick={onBuyNow}
                disabled={outOfStock}
                className="btn-gold py-3.5"
              >
                Buy Now
              </button>

              <button
                onClick={onWishlist}
                aria-label="Wishlist"
                className={classNames(
                  'flex h-12 w-12 items-center justify-center rounded-full border transition',
                  isWished ? 'border-rose-500 bg-rose-500 text-warmwhite' : 'border-ink-200 text-ink-700 hover:border-ink-900',
                )}
              >
                <Heart className={classNames('h-5 w-5', isWished && 'fill-current')} />
              </button>

              <button
                onClick={onShare}
                aria-label="Share"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition hover:border-ink-900"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            {/* Stock */}
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span
                className={classNames(
                  'h-2 w-2 rounded-full',
                  outOfStock ? 'bg-ink-300' : (selectedShade?.stock ?? product.stock) <= product.low_stock_threshold ? 'bg-amber-400' : 'bg-emerald-400',
                )}
              />
              <span className={outOfStock ? 'text-ink-500' : 'text-emerald-700'}>
                {outOfStock ? 'Out of stock' : (selectedShade?.stock ?? product.stock) <= product.low_stock_threshold ? 'Low stock — order soon' : 'In stock'}
              </span>
              <span className="text-ink-400">· SKU: {product.sku}</span>
            </div>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-3 gap-3 rounded-3xl bg-cream/70 p-5">
              {[
                { icon: Truck, title: 'Free Shipping', sub: 'On orders $75+' },
                { icon: RotateCcw, title: '30-Day Returns', sub: 'On unopened items' },
                { icon: ShieldCheck, title: '100% Authentic', sub: 'Sourced directly' },
              ].map((b) => (
                <div key={b.title} className="flex flex-col items-center text-center">
                  <b.icon className="h-5 w-5 text-champagne-600" />
                  <p className="mt-2 text-xs font-semibold text-ink-900">{b.title}</p>
                  <p className="text-[11px] text-ink-500">{b.sub}</p>
                </div>
              ))}
            </div>

            {/* Benefits */}
            {product.benefits && (
              <div className="mt-6 rounded-3xl border border-champagne-200 bg-champagne-50/60 p-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-champagne-700">Benefits</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">{product.benefits}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex flex-wrap gap-1 border-b border-ink-100">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={classNames(
                  'relative px-5 py-3.5 text-sm font-medium transition',
                  activeTab === t.id ? 'text-ink-900' : 'text-ink-500 hover:text-ink-800',
                )}
              >
                {t.label}
                {activeTab === t.id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-ink-900"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose-luxe max-w-3xl">
                <p className="text-base leading-relaxed text-ink-700">{product.description}</p>
                {product.warnings && (
                  <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
                    <strong>Warnings:</strong> {product.warnings}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'ingredients' && (
              <p className="max-w-3xl whitespace-pre-line text-base leading-relaxed text-ink-700">{product.ingredients}</p>
            )}
            {activeTab === 'how-to-use' && (
              <p className="max-w-3xl whitespace-pre-line text-base leading-relaxed text-ink-700">{product.how_to_use}</p>
            )}
            {activeTab === 'shipping' && (
              <div className="max-w-3xl space-y-4 text-base leading-relaxed text-ink-700">
                <p>{product.shipping_info}</p>
                <p>{product.returns_info}</p>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="grid gap-10 lg:grid-cols-3">
                {/* Summary */}
                <div className="lg:col-span-1">
                  <div className="rounded-3xl bg-cream/70 p-6">
                    <div className="text-center">
                      <p className="font-display text-5xl font-medium text-ink-900">{product.rating.toFixed(1)}</p>
                      <div className="mt-2 flex justify-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={classNames('h-4 w-4', i < Math.round(product.rating) ? 'fill-champagne-400 text-champagne-400' : 'text-ink-200')} />
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-ink-500">{product.review_count.toLocaleString()} reviews</p>
                    </div>
                    <div className="mt-5 space-y-2">
                      {ratingBreakdown.map((r) => (
                        <div key={r.star} className="flex items-center gap-2 text-xs">
                          <span className="w-6 text-ink-600">{r.star}★</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                            <div className="h-full rounded-full bg-champagne-400" style={{ width: `${r.pct}%` }} />
                          </div>
                          <span className="w-8 text-right text-ink-500">{r.count}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setReviewForm((f) => ({ ...f, open: true }))}
                      className="btn-outline mt-6 w-full"
                    >
                      Write a Review
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-6">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-ink-500">No reviews yet. Be the first to share your experience.</p>
                  ) : (
                    reviews.map((r) => (
                      <div key={r.id} className="border-b border-ink-100 pb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream font-medium text-ink-700">
                              {r.author_name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-ink-900">{r.author_name}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={classNames('h-3 w-3', i < r.rating ? 'fill-champagne-400 text-champagne-400' : 'text-ink-200')} />
                                  ))}
                                </div>
                                {r.is_verified && (
                                  <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-700">Verified</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-ink-400">{timeAgo(r.created_at)}</span>
                        </div>
                        {r.title && <h4 className="mt-3 font-display text-base font-medium text-ink-900">{r.title}</h4>}
                        {r.body && <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{r.body}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-8 font-display text-display-md font-medium text-ink-900">You May Also Love</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom modal */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-900/90 p-6"
            onClick={() => setZoomOpen(false)}
          >
            <motion.img
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              src={gallery[activeImage] ?? ''}
              alt={product.name}
              className="max-h-full max-w-full rounded-3xl object-contain"
            />
            <button className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-warmwhite/20 text-warmwhite">
              <ChevronDown className="h-5 w-5 rotate-180" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review modal */}
      <AnimatePresence>
        {reviewForm.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm"
            onClick={() => setReviewForm((f) => ({ ...f, open: false }))}
          >
            <motion.form
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onSubmit={submitReview}
              className="w-full max-w-md rounded-3xl bg-warmwhite p-7 shadow-luxe-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-xl font-medium text-ink-900">Write a Review</h3>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="label-luxe">Your Name</label>
                  <input
                    value={reviewForm.author}
                    onChange={(e) => setReviewForm((f) => ({ ...f, author: e.target.value }))}
                    placeholder="Anonymous"
                    className="input-luxe"
                  />
                </div>
                <div>
                  <label className="label-luxe">Rating</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                      >
                        <Star className={classNames('h-7 w-7 transition', n <= reviewForm.rating ? 'fill-champagne-400 text-champagne-400' : 'text-ink-200 hover:text-champagne-300')} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label-luxe">Title</label>
                  <input
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Summarize your experience"
                    className="input-luxe"
                  />
                </div>
                <div>
                  <label className="label-luxe">Review</label>
                  <textarea
                    value={reviewForm.body}
                    onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                    placeholder="What did you love? What could be better?"
                    rows={4}
                    className="input-luxe resize-none"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setReviewForm((f) => ({ ...f, open: false }))} className="btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Submit
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
