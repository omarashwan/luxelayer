import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import type { CartItem, Coupon, Product, Shade, Size, UUID } from '../types';
import { effectivePrice } from '../lib/utils';

const CART_KEY = 'luxelayer.cart.v1';
const COUPON_KEY = 'luxelayer.coupon.v1';

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, opts?: { shade?: Shade | null; size?: Size | null; quantity?: number }) => void;
  removeItem: (productId: UUID, shadeId: UUID | null, sizeId: UUID | null) => void;
  updateQuantity: (productId: UUID, shadeId: UUID | null, sizeId: UUID | null, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  giftWrap: boolean;
  setGiftWrap: (v: boolean) => void;
  appliedCoupon: Coupon | null;
  couponCode: string;
  applyCoupon: (code: string) => Promise<{ error: string | null }>;
  removeCoupon: () => void;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  freeShippingThreshold: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 75;
const SHIPPING_FLAT = 7.95;
const TAX_RATE = 0.08;
const GIFT_WRAP_FEE = 5;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_KEY);
      }
    } catch {
      // ignore
    }
  }, [appliedCoupon]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COUPON_KEY);
      if (raw) {
        const c = JSON.parse(raw) as Coupon;
        setAppliedCoupon(c);
        setCouponCode(c.code);
      }
    } catch {
      // ignore
    }
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem: CartContextValue['addItem'] = useCallback((product, opts = {}) => {
    const shade = opts.shade ?? null;
    const size = opts.size ?? null;
    const quantity = opts.quantity ?? 1;
    const base = effectivePrice(product.price, product.sale_price);
    const unit = base + (size?.price_adjustment ?? 0);
    const stock = (shade?.stock ?? size?.stock ?? product.stock) || 0;

    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === product.id && i.shadeId === (shade?.id ?? null) && i.sizeId === (size?.id ?? null),
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: Math.min(next[idx].quantity + quantity, stock || 99),
        };
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.featured_image_url,
          price: unit,
          basePrice: base,
          quantity: Math.min(quantity, stock || 99),
          shadeId: shade?.id ?? null,
          shadeName: shade?.name ?? null,
          sizeId: size?.id ?? null,
          sizeName: size?.name ?? null,
          stock,
          brandName: product.brand?.name,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeItem: CartContextValue['removeItem'] = useCallback((productId, shadeId, sizeId) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.shadeId === shadeId && i.sizeId === sizeId)),
    );
  }, []);

  const updateQuantity: CartContextValue['updateQuantity'] = useCallback((productId, shadeId, sizeId, quantity) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId === productId && i.shadeId === shadeId && i.sizeId === sizeId) {
          const max = i.stock || 99;
          return { ...i, quantity: Math.max(1, Math.min(quantity, max)) };
        }
        return i;
      }),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setGiftWrap(false);
    setAppliedCoupon(null);
    setCouponCode('');
  }, []);

  const applyCoupon: CartContextValue['applyCoupon'] = useCallback(async (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return { error: 'Enter a code' };
    // Validate against DB via anon read policy
    const { supabase } = await import('../lib/supabase');
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', normalized)
      .eq('is_active', true)
      .maybeSingle();
    if (error || !data) return { error: 'Invalid or expired code' };
    const coupon = data as Coupon;
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
      return { error: 'This code has expired' };
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses)
      return { error: 'This code has reached its usage limit' };
    setAppliedCoupon(coupon);
    setCouponCode(coupon.code);
    return { error: null };
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponCode('');
  }, []);

  const { itemCount, subtotal, discount, shipping, tax, total } = useMemo(() => {
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    let discount = 0;
    let freeShipping = false;
    if (appliedCoupon) {
      if (subtotal >= appliedCoupon.min_purchase) {
        if (appliedCoupon.discount_type === 'percentage') {
          discount = (subtotal * appliedCoupon.discount_value) / 100;
        } else if (appliedCoupon.discount_type === 'fixed') {
          discount = Math.min(appliedCoupon.discount_value, subtotal);
        } else if (appliedCoupon.discount_type === 'free_shipping') {
          freeShipping = true;
        }
      }
    }
    const wrapFee = giftWrap ? GIFT_WRAP_FEE : 0;
    const afterDiscount = Math.max(subtotal - discount, 0);
    const shipping = items.length === 0 ? 0 : freeShipping || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
    const tax = (afterDiscount + wrapFee) * TAX_RATE;
    const total = afterDiscount + shipping + tax + wrapFee;
    return { itemCount, subtotal, discount, shipping, tax, total };
  }, [items, appliedCoupon, giftWrap]);

  const value: CartContextValue = {
    items,
    isOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
    giftWrap,
    setGiftWrap,
    appliedCoupon,
    couponCode,
    applyCoupon,
    removeCoupon,
    discount,
    shipping,
    tax,
    total,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
