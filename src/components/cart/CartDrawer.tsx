import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Minus, Plus, Trash2, Tag, Gift, Truck, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { classNames, formatPrice } from '../../lib/utils';

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    itemCount,
    giftWrap,
    setGiftWrap,
    appliedCoupon,
    couponCode,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
  } = useCart();
  const { toast } = useToast();
  const [couponInput, setCouponInput] = useState('');
  const remaining = Math.max(freeShippingThreshold - (subtotal - discount), 0);
  const freeShippingProgress = Math.min(((subtotal - discount) / freeShippingThreshold) * 100, 100);

  const onApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await applyCoupon(couponInput);
    if (error) toast(error, 'error');
    else {
      toast('Coupon applied');
      setCouponInput('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-ink-900/40 backdrop-blur-sm"
          onClick={closeCart}
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-warmwhite shadow-luxe-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-ink-800" />
                <h2 className="font-display text-lg font-medium">Your Bag</h2>
                <span className="text-sm text-ink-400">({itemCount})</span>
              </div>
              <button onClick={closeCart} aria-label="Close" className="rounded-full p-2 text-ink-600 hover:bg-ink-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cream">
                  <ShoppingBag className="h-8 w-8 text-ink-400" />
                </div>
                <div>
                  <p className="font-display text-xl text-ink-900">Your bag is empty</p>
                  <p className="mt-1 text-sm text-ink-500">Discover our latest luxury beauty edits.</p>
                </div>
                <Link to="/shop" onClick={closeCart} className="btn-primary mt-2">
                  Continue Shopping
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                {/* Free shipping progress */}
                <div className="border-b border-ink-100 bg-cream/60 px-5 py-3">
                  {remaining > 0 ? (
                    <p className="flex items-center gap-2 text-xs text-ink-700">
                      <Truck className="h-3.5 w-3.5 text-champagne-600" />
                      Add <span className="font-semibold text-ink-900">{formatPrice(remaining)}</span> for free shipping
                    </p>
                  ) : (
                    <p className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                      <Truck className="h-3.5 w-3.5" />
                      You've unlocked free shipping
                    </p>
                  )}
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-champagne-400 to-gold-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShippingProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <ul className="space-y-5">
                    <AnimatePresence>
                      {items.map((item) => (
                        <motion.li
                          key={`${item.productId}-${item.shadeId ?? 'x'}-${item.sizeId ?? 'x'}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, x: 40 }}
                          transition={{ duration: 0.3 }}
                          className="flex gap-4"
                        >
                          <Link to={`/product/${item.slug}`} onClick={closeCart} className="shrink-0">
                            <img
                              src={item.image ?? ''}
                              alt={item.name}
                              className="h-24 w-20 rounded-xl object-cover"
                            />
                          </Link>
                          <div className="flex flex-1 flex-col">
                            <div className="flex justify-between gap-2">
                              <div>
                                <Link
                                  to={`/product/${item.slug}`}
                                  onClick={closeCart}
                                  className="font-display text-sm font-medium text-ink-900 line-clamp-2 hover:text-champagne-700"
                                >
                                  {item.name}
                                </Link>
                                {item.brandName && (
                                  <p className="text-xs text-champagne-600">{item.brandName}</p>
                                )}
                              </div>
                              <button
                                onClick={() => removeItem(item.productId, item.shadeId, item.sizeId)}
                                className="text-ink-400 transition hover:text-rose-600"
                                aria-label="Remove"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            {(item.shadeName || item.sizeName) && (
                              <p className="mt-1 text-xs text-ink-500">
                                {item.shadeName && <span>{item.shadeName}</span>}
                                {item.shadeName && item.sizeName && <span> · </span>}
                                {item.sizeName && <span>{item.sizeName}</span>}
                              </p>
                            )}
                            <div className="mt-auto flex items-center justify-between pt-2">
                              <div className="flex items-center rounded-full border border-ink-200">
                                <button
                                  onClick={() => updateQuantity(item.productId, item.shadeId, item.sizeId, item.quantity - 1)}
                                  className="flex h-8 w-8 items-center justify-center text-ink-700 hover:text-ink-900"
                                  aria-label="Decrease"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.productId, item.shadeId, item.sizeId, item.quantity + 1)}
                                  className="flex h-8 w-8 items-center justify-center text-ink-700 hover:text-ink-900"
                                  aria-label="Increase"
                                  disabled={item.quantity >= (item.stock || 99)}
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <span className="font-display text-base font-medium text-ink-900">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>

                  {/* Gift wrap */}
                  <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-2xl bg-cream/60 p-3.5">
                    <span className="flex h-5 w-5 items-center justify-center">
                      <input
                        type="checkbox"
                        checked={giftWrap}
                        onChange={(e) => setGiftWrap(e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="h-5 w-5 rounded-md border border-ink-300 transition peer-checked:border-champagne-500 peer-checked:bg-champagne-500 peer-checked:ring-2 peer-checked:ring-champagne-200" />
                    </span>
                    <Gift className="h-4 w-4 text-champagne-600" />
                    <span className="flex-1 text-sm text-ink-800">Luxury gift wrapping</span>
                    <span className="text-sm font-medium text-ink-700">+$5.00</span>
                  </label>

                  {/* Coupon */}
                  <div className="mt-4 rounded-2xl border border-ink-100 p-3.5">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Tag className="h-4 w-4 text-emerald-600" />
                          <span className="font-medium text-ink-900">{couponCode}</span>
                          <span className="text-ink-500">applied</span>
                        </div>
                        <button onClick={removeCoupon} className="text-xs text-ink-500 hover:text-rose-600">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={onApply} className="flex gap-2">
                        <input
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="Promo code"
                          className="input-luxe h-10 flex-1 text-sm"
                        />
                        <button type="submit" className="btn-ghost h-10 px-4 text-sm">
                          Apply
                        </button>
                      </form>
                    )}
                    <p className="mt-2 text-[11px] text-ink-400">Try WELCOME10 for 10% off your first order</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="border-t border-ink-100 px-5 py-4">
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-ink-600">Subtotal</dt>
                      <dd className="font-medium text-ink-900">{formatPrice(subtotal)}</dd>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <dt>Discount</dt>
                        <dd>-{formatPrice(discount)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-ink-600">Shipping</dt>
                      <dd className={classNames(shipping === 0 ? 'text-emerald-700' : 'text-ink-900')}>
                        {shipping === 0 ? 'Free' : formatPrice(shipping)}
                      </dd>
                    </div>
                    {giftWrap && (
                      <div className="flex justify-between">
                        <dt className="text-ink-600">Gift wrap</dt>
                        <dd className="text-ink-900">{formatPrice(5)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-ink-600">Tax (est.)</dt>
                      <dd className="text-ink-900">{formatPrice(tax)}</dd>
                    </div>
                    <div className="mt-2 flex justify-between border-t border-ink-100 pt-2.5">
                      <dt className="font-display text-base text-ink-900">Total</dt>
                      <dd className="font-display text-lg font-semibold text-ink-900">{formatPrice(total)}</dd>
                    </div>
                  </dl>
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="btn-gold mt-4 w-full"
                  >
                    Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button onClick={closeCart} className="mt-2 w-full text-center text-xs text-ink-500 hover:text-ink-800">
                    Continue shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
