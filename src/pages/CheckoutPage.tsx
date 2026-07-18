import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, CreditCard, Truck, Gift, Lock, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { generateOrderNumber, formatPrice, classNames } from '../lib/utils';
import type { Order } from '../types';

type Step = 'shipping' | 'billing' | 'payment' | 'review' | 'confirmation';

const STEPS: { id: Step; label: string }[] = [
  { id: 'shipping', label: 'Shipping' },
  { id: 'billing', label: 'Billing' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
];

export function CheckoutPage() {
  const { items, subtotal, discount, shipping, tax, total, giftWrap, appliedCoupon, clearCart } = useCart();
  const { session, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('shipping');
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const [ship, setShip] = useState({
    firstName: profile?.first_name ?? '',
    lastName: profile?.last_name ?? '',
    email: profile?.email ?? session?.user?.email ?? '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: '',
    method: 'standard',
  });
  const [billingSame, setBillingSame] = useState(true);
  const [payment, setPayment] = useState({ method: 'card', cardName: '', cardNumber: '', expiry: '', cvc: '' });
  const [giftNote, setGiftNote] = useState('');

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="container-luxe flex min-h-[60vh] flex-col items-center justify-center text-center">
        <ShoppingBag className="h-12 w-12 text-ink-300" />
        <p className="mt-4 font-display text-2xl text-ink-900">Your bag is empty</p>
        <p className="mt-1 text-sm text-ink-500">Add something beautiful to continue.</p>
        <Link to="/shop" className="btn-primary mt-6">Shop Now</Link>
      </div>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.id === step);

  const next = () => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].id);
  };
  const prev = () => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx > 0) setStep(STEPS[idx - 1].id);
  };

  const placeOrder = async () => {
    setSubmitting(true);
    const orderNumber = generateOrderNumber();
    const orderInsert = {
      order_number: orderNumber,
      user_id: session?.user?.id ?? null,
      email: ship.email,
      status: 'processing',
      subtotal,
      discount,
      shipping,
      tax,
      total,
      coupon_code: appliedCoupon?.code ?? null,
      shipping_first_name: ship.firstName,
      shipping_last_name: ship.lastName,
      shipping_address1: ship.address1,
      shipping_address2: ship.address2,
      shipping_city: ship.city,
      shipping_state: ship.state,
      shipping_postal_code: ship.postalCode,
      shipping_country: ship.country,
      shipping_phone: ship.phone,
      shipping_method: ship.method,
      payment_method: payment.method,
      payment_status: 'paid',
      gift_wrap: giftWrap,
      notes: giftNote,
    };

    try {
      const { data: order, error } = await supabase.from('orders').insert(orderInsert).select().single();
      if (error || !order) throw new Error(error?.message ?? 'Failed to create order');

      const itemsInsert = items.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        name: i.name,
        slug: i.slug,
        image_url: i.image,
        shade: i.shadeName,
        size: i.sizeName,
        unit_price: i.price,
        quantity: i.quantity,
        total: i.price * i.quantity,
      }));
      const { error: itemsError } = await supabase.from('order_items').insert(itemsInsert);
      if (itemsError) throw new Error(itemsError.message);

      setCreatedOrder(order as Order);
      clearCart();
      setStep('confirmation');
      toast('Order placed successfully');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to place order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'confirmation' && createdOrder) {
    navigate(`/order/${createdOrder.order_number}`);
    return null;
  }

  return (
    <div className="bg-ivory">
      <div className="border-b border-ink-100 bg-warmwhite">
        <div className="container-luxe py-6">
          <Link to="/shop" className="flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900">
            <ChevronLeft className="h-4 w-4" /> Continue shopping
          </Link>
          <h1 className="mt-3 font-display text-display-md font-medium text-ink-900">Checkout</h1>
        </div>
      </div>

      <div className="container-luxe py-10">
        {/* Stepper */}
        <div className="mb-10 flex items-center justify-center gap-2 sm:gap-4">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={classNames(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition',
                    i < currentIdx
                      ? 'bg-emerald-500 text-warmwhite'
                      : i === currentIdx
                        ? 'bg-ink-900 text-warmwhite'
                        : 'bg-ink-100 text-ink-400',
                  )}
                >
                  {i < currentIdx ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={classNames('hidden text-sm font-medium sm:block', i <= currentIdx ? 'text-ink-900' : 'text-ink-400')}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className={classNames('h-px w-8 sm:w-16', i < currentIdx ? 'bg-emerald-500' : 'bg-ink-200')} />}
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 'shipping' && (
                <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="mb-5 flex items-center gap-2 font-display text-xl font-medium text-ink-900">
                    <Truck className="h-5 w-5 text-champagne-600" /> Shipping Address
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="First Name" value={ship.firstName} onChange={(v) => setShip((s) => ({ ...s, firstName: v }))} />
                    <Field label="Last Name" value={ship.lastName} onChange={(v) => setShip((s) => ({ ...s, lastName: v }))} />
                    <Field label="Email" type="email" value={ship.email} onChange={(v) => setShip((s) => ({ ...s, email: v }))} className="sm:col-span-2" />
                    <Field label="Address" value={ship.address1} onChange={(v) => setShip((s) => ({ ...s, address1: v }))} className="sm:col-span-2" />
                    <Field label="Apartment, suite (optional)" value={ship.address2} onChange={(v) => setShip((s) => ({ ...s, address2: v }))} className="sm:col-span-2" />
                    <Field label="City" value={ship.city} onChange={(v) => setShip((s) => ({ ...s, city: v }))} />
                    <Field label="State / Province" value={ship.state} onChange={(v) => setShip((s) => ({ ...s, state: v }))} />
                    <Field label="Postal Code" value={ship.postalCode} onChange={(v) => setShip((s) => ({ ...s, postalCode: v }))} />
                    <Field label="Phone" value={ship.phone} onChange={(v) => setShip((s) => ({ ...s, phone: v }))} />
                  </div>

                  <div className="mt-6">
                    <h3 className="mb-3 text-sm font-medium text-ink-800">Shipping Method</h3>
                    <div className="space-y-2">
                      {[
                        { id: 'standard', label: 'Standard (3-5 business days)', price: shipping === 0 ? 'Free' : formatPrice(7.95) },
                        { id: 'express', label: 'Express (2 business days)', price: formatPrice(18.95) },
                        { id: 'overnight', label: 'Overnight', price: formatPrice(34.95) },
                      ].map((m) => (
                        <label key={m.id} className="flex cursor-pointer items-center justify-between rounded-xl border border-ink-200 p-4 transition has-[:checked]:border-champagne-500 has-[:checked]:bg-champagne-50">
                          <span className="flex items-center gap-3">
                            <input type="radio" name="method" checked={ship.method === m.id} onChange={() => setShip((s) => ({ ...s, method: m.id }))} className="peer sr-only" />
                            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-ink-300 peer-checked:border-champagne-500 peer-checked:bg-champagne-500">
                              {ship.method === m.id && <span className="h-2 w-2 rounded-full bg-warmwhite" />}
                            </span>
                            <span className="text-sm text-ink-800">{m.label}</span>
                          </span>
                          <span className="text-sm font-medium text-ink-900">{m.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button onClick={next} disabled={!ship.firstName || !ship.lastName || !ship.email || !ship.address1 || !ship.city || !ship.postalCode} className="btn-primary mt-6">
                    Continue to Billing
                  </button>
                </motion.div>
              )}

              {step === 'billing' && (
                <motion.div key="billing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="mb-5 font-display text-xl font-medium text-ink-900">Billing Address</h2>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-200 p-4 transition has-[:checked]:border-champagne-500 has-[:checked]:bg-champagne-50">
                    <input type="checkbox" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} className="peer sr-only" />
                    <span className="flex h-5 w-5 items-center justify-center rounded-md border border-ink-300 peer-checked:border-champagne-500 peer-checked:bg-champagne-500">
                      {billingSame && <Check className="h-3 w-3 text-warmwhite" />}
                    </span>
                    <span className="text-sm text-ink-800">Billing address is the same as shipping address</span>
                  </label>
                  {!billingSame && (
                    <div className="mt-4 rounded-xl bg-cream p-4 text-sm text-ink-600">
                      Please enter your billing details — this is a demo and the form is omitted for brevity.
                    </div>
                  )}
                  <div className="mt-6 flex gap-3">
                    <button onClick={prev} className="btn-ghost">Back</button>
                    <button onClick={next} className="btn-primary flex-1">Continue to Payment</button>
                  </div>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="mb-5 flex items-center gap-2 font-display text-xl font-medium text-ink-900">
                    <CreditCard className="h-5 w-5 text-champagne-600" /> Payment Method
                  </h2>
                  <div className="rounded-2xl bg-cream/70 p-4 text-sm text-ink-600">
                    This is a demo store — no real payment is processed. Use any details below.
                  </div>
                  <div className="mt-4 space-y-4">
                    <Field label="Name on Card" value={payment.cardName} onChange={(v) => setPayment((p) => ({ ...p, cardName: v }))} />
                    <Field label="Card Number" value={payment.cardNumber} onChange={(v) => setPayment((p) => ({ ...p, cardNumber: v }))} placeholder="4242 4242 4242 4242" />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Expiry" value={payment.expiry} onChange={(v) => setPayment((p) => ({ ...p, expiry: v }))} placeholder="MM/YY" />
                      <Field label="CVC" value={payment.cvc} onChange={(v) => setPayment((p) => ({ ...p, cvc: v }))} placeholder="123" />
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button onClick={prev} className="btn-ghost">Back</button>
                    <button onClick={next} className="btn-primary flex-1">Review Order</button>
                  </div>
                </motion.div>
              )}

              {step === 'review' && (
                <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="mb-5 font-display text-xl font-medium text-ink-900">Review Your Order</h2>

                  <div className="space-y-4">
                    <ReviewBlock title="Shipping Address">
                      {ship.firstName} {ship.lastName}<br />
                      {ship.address1}{ship.address2 && `, ${ship.address2}`}<br />
                      {ship.city}, {ship.state} {ship.postalCode}<br />
                      {ship.country}<br />
                      {ship.email} · {ship.phone}
                    </ReviewBlock>
                    <ReviewBlock title="Shipping Method">
                      {ship.method === 'standard' ? 'Standard (3-5 business days)' : ship.method === 'express' ? 'Express (2 business days)' : 'Overnight'}
                    </ReviewBlock>
                    <ReviewBlock title="Payment">
                      <span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-emerald-600" /> {payment.cardName || 'Card'} · {payment.cardNumber ? `•••• ${payment.cardNumber.slice(-4)}` : 'Demo card'}</span>
                    </ReviewBlock>
                    {giftWrap && (
                      <ReviewBlock title="Gift Wrap">
                        <span className="flex items-center gap-2"><Gift className="h-3.5 w-3.5 text-champagne-600" /> Luxury gift wrapping included</span>
                      </ReviewBlock>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button onClick={prev} className="btn-ghost">Back</button>
                    <button onClick={placeOrder} disabled={submitting} className="btn-gold flex-1">
                      <Lock className="h-4 w-4" />
                      {submitting ? 'Placing Order…' : `Place Order · ${formatPrice(total)}`}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-3xl bg-warmwhite p-6 shadow-luxe-sm ring-1 ring-ink-100">
              <h3 className="font-display text-lg font-medium text-ink-900">Order Summary</h3>
              <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto">
                {items.map((i) => (
                  <li key={`${i.productId}-${i.shadeId}-${i.sizeId}`} className="flex gap-3">
                    <div className="relative">
                      <img src={i.image ?? ''} alt={i.name} className="h-14 w-12 rounded-lg object-cover" />
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-900 px-1 text-[10px] font-semibold text-warmwhite">
                        {i.quantity}
                      </span>
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-ink-900 line-clamp-1">{i.name}</p>
                      {(i.shadeName || i.sizeName) && <p className="text-xs text-ink-500">{i.shadeName}{i.shadeName && i.sizeName && ' · '}{i.sizeName}</p>}
                    </div>
                    <span className="text-sm font-medium text-ink-900">{formatPrice(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-5 space-y-2 border-t border-ink-100 pt-5 text-sm">
                <Row label="Subtotal" value={formatPrice(subtotal)} />
                {discount > 0 && <Row label="Discount" value={`-${formatPrice(discount)}`} accent="emerald" />}
                <Row label="Shipping" value={shipping === 0 ? 'Free' : formatPrice(shipping)} accent={shipping === 0 ? 'emerald' : undefined} />
                <Row label="Tax" value={formatPrice(tax)} />
                {giftWrap && <Row label="Gift wrap" value={formatPrice(5)} />}
                <div className="flex justify-between border-t border-ink-100 pt-3">
                  <dt className="font-display text-base text-ink-900">Total</dt>
                  <dd className="font-display text-lg font-semibold text-ink-900">{formatPrice(total)}</dd>
                </div>
              </dl>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-500">
                <Lock className="h-3 w-3" /> Secure checkout · 256-bit encryption
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, className }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="label-luxe">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input-luxe" />
    </div>
  );
}

function ReviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-100 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">{title}</p>
      <div className="mt-2 text-sm text-ink-800">{children}</div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: 'emerald' }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-600">{label}</dt>
      <dd className={accent === 'emerald' ? 'text-emerald-700' : 'text-ink-900'}>{value}</dd>
    </div>
  );
}
