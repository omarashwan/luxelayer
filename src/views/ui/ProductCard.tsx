import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../controllers/CartContext';
import { useWishlist } from '../../controllers/WishlistContext';
import { useToast } from '../../controllers/ToastContext';
import { classNames, discountPercent, effectivePrice, formatPrice } from '../../models/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast();
  const isWished = has(product.id);
  const discount = discountPercent(product.price, product.sale_price);
  const price = effectivePrice(product.price, product.sale_price);
  const outOfStock = product.stock <= 0;

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) {
      toast('Out of stock', 'error');
      return;
    }
    addItem(product, { quantity: 1 });
    toast(`${product.name} added to bag`);
  };

  const onWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product);
    toast(isWished ? 'Removed from wishlist' : 'Added to wishlist', isWished ? 'info' : 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/product/${product.slug}`} className="group block">
        <div className="relative card-luxe overflow-hidden p-0 transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-luxe-lg">
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden bg-cream">
            <img
              src={product.featured_image_url ?? ''}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1100ms] ease-luxe group-hover:scale-110"
            />
            {/* Badges */}
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {discount > 0 && (
                <span className="rounded-full bg-ink-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-warmwhite">
                  -{discount}%
                </span>
              )}
              {product.is_new && (
                <span className="rounded-full bg-champagne-400 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-900">
                  New
                </span>
              )}
              {product.is_bestseller && !product.is_new && (
                <span className="rounded-full bg-blush-300 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-900">
                  Bestseller
                </span>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={onWishlist}
              aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
              className={classNames(
                'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300',
                isWished ? 'bg-rose-500 text-warmwhite' : 'bg-warmwhite/80 text-ink-700 hover:bg-warmwhite',
              )}
            >
              <Heart className={classNames('h-4 w-4', isWished && 'fill-current')} />
            </button>

            {/* Quick add */}
            <div className="absolute inset-x-3 bottom-3 translate-y-[120%] opacity-0 transition-all duration-500 ease-luxe group-hover:translate-y-0 group-hover:opacity-100">
              <button
                onClick={onAdd}
                disabled={outOfStock}
                className={classNames(
                  'flex w-full items-center justify-center gap-2 rounded-full py-3 text-xs font-semibold tracking-wide backdrop-blur-md transition active:scale-[0.98]',
                  outOfStock ? 'bg-ink-200 text-ink-500 cursor-not-allowed' : 'bg-ink-900/90 text-warmwhite hover:bg-ink-900',
                )}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                {outOfStock ? 'Sold Out' : 'Quick Add'}
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            {product.brand?.name && (
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-champagne-600">
                {product.brand.name}
              </p>
            )}
            <h3 className="mt-1.5 font-display text-[15px] font-medium leading-snug text-ink-900 line-clamp-2">
              {product.name}
            </h3>
            {product.short_description && (
              <p className="mt-1 text-xs text-ink-500 line-clamp-1">{product.short_description}</p>
            )}
            <div className="mt-2 flex items-center gap-1.5">
              <Star className="h-3 w-3 fill-champagne-400 text-champagne-400" />
              <span className="text-xs font-medium text-ink-700">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-ink-400">({product.review_count.toLocaleString()})</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-lg font-medium text-ink-900">{formatPrice(price)}</span>
                {discount > 0 && (
                  <span className="text-xs text-ink-400 line-through">{formatPrice(product.price)}</span>
                )}
              </div>
              <span
                className={classNames(
                  'h-2 w-2 rounded-full',
                  outOfStock ? 'bg-ink-300' : product.stock <= product.low_stock_threshold ? 'bg-amber-400' : 'bg-emerald-400',
                )}
                title={outOfStock ? 'Out of stock' : 'In stock'}
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
