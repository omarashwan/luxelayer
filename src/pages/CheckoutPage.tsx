import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgePercent, Banknote, Check, ChevronLeft, CreditCard, Gift, Lock, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../controllers/CartContext';
import { useAuth } from '../controllers/AuthContext';
import { useToast } from '../controllers/ToastContext';
import { formatPrice, classNames } from '../models/utils';

const CHECKOUT_DRAFT_KEY = 'luxelayer.checkout.draft.v1';

type Step = 'shipping' | 'payment';
type PaymentMethod = 'card' | 'cash_on_delivery';

const STEPS: { id: Step; label: string }[] = [
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payment' },
];

function readCheckoutDraft(): { ship?: Partial<ShippingForm>; paymentMethod?: PaymentMethod; step?: Step } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as { ship?: Partial<ShippingForm>; paymentMethod?: PaymentMethod; step?: Step }) : null;
  } catch {
    return null;
  }
}

interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  method: string;
}

function getPaymentsApiBaseUrl() {
  const configured = import.meta.env.VITE_PAYMENTS_API_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  return import.meta.env.DEV ? 'http://localhost:4000' : window.location.origin;
}

export function CheckoutPage() {
  const { items, subtotal, discount, shipping, tax, total, giftWrap, appliedCoupon } = useCart();
  const { session, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const draft = useMemo(() => readCheckoutDraft(), []);

  const [step, setStep] = useState<Step>(draft?.step ?? 'shipping');
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(draft?.paymentMethod ?? 'card');

  const [ship, setShip] = useState<ShippingForm>({
    firstName: draft?.ship?.firstName ?? profile?.first_name ?? '',
    lastName: draft?.ship?.lastName ?? profile?.last_name ?? '',
    email: draft?.ship?.email ?? profile?.email ?? session?.user?.email ?? '',
    address1: draft?.ship?.address1 ?? '',
    address2: draft?.ship?.address2 ?? '',
    city: draft?.ship?.city ?? '',
    state: draft?.ship?.state ?? '',
    postalCode: draft?.ship?.postalCode ?? '',
    country: draft?.ship?.country ?? 'United States',
    phone: draft?.ship?.phone ?? '',
    method: draft?.ship?.method ?? 'standard',
  });

  const paymentFailed = useMemo(() => new URLSearchParams(location.search).get('payment') === 'failed', [location.search]);

  useEffect(() => {
    if (paymentFailed) {
      setStep('payment');
    }
  }, [paymentFailed]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify({ ship, paymentMethod, step }));
    } catch {
      // ignore
    }
  }, [ship, paymentMethod, step]);

  if (items.length === 0 && step !== 'payment') {
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
    if (step === 'shipping') {
      setStep('payment');
    }
  };

  const prev = () => {
    if (step === 'payment') {
      setStep('shipping');
    }
  };

  const submitPayment = async () => {
    setSubmitting(true);
    try {
      const accessToken = session?.access_token ?? '';
      if (!accessToken) {
        throw new Error('Please sign in before checkout.');
      }
      if (!ship.phone.trim()) {
        throw new Error('Please add a phone number before checkout.');
      }
      const response = await fetch(`${getPaymentsApiBaseUrl()}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            shadeId: item.shadeId,
            sizeId: item.sizeId,
          })),
          shipping: ship,
          paymentMethod,
          couponCode: appliedCoupon?.code ?? '',
          giftWrap,
          giftNote: '',
          userId: session?.user?.id ?? null,
          accessToken,
        }),
      });

      const data = await response.json() as { success?: boolean; message?: string; paymentUrl?: string };
      if (!response.ok || !data.success || !data.paymentUrl) {
        throw new Error(data.message || 'Unable to start Paymob checkout.');
      }

      window.location.assign(data.paymentUrl);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to start payment', 'error');
      setSubmitting(false);
    }
  };

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
        {paymentFailed && (
          <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Payment failed or was cancelled. Your order was not marked as paid. Please try again.
          </div>
        )}

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

                    <button onClick={next} disabled={!ship.firstName || !ship.lastName || !ship.email || !ship.address1 || !ship.city || !ship.postalCode || !ship.phone} className="btn-primary mt-6">
                    Continue to Payment
                  </button>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 font-display text-xl font-medium text-ink-900">
                      <CreditCard className="h-5 w-5 text-champagne-600" /> Payment Method
                    </h2>
                    <div className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 text-xs font-medium text-ink-600">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Hosted securely by Paymob
                    </div>
                  </div>

                  <p className="mb-4 max-w-2xl text-sm text-ink-600">
                    Choose exactly one payment option. Payment is processed on Paymob’s hosted checkout, so LuxeLayer never sees card details.
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <PaymentOptionCard
                      title="Cash on Delivery"
                      description="Send a 20% deposit online. The remaining balance is collected when the order is delivered."
                      badge="20% Deposit Required"
                      icon={<Banknote className="h-7 w-7 text-amber-700" />}
                      selected={paymentMethod === 'cash_on_delivery'}
                      onSelect={() => setPaymentMethod('cash_on_delivery')}
                      accent="amber"
                    >
                      <div className="mt-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-amber-700">
                        <BadgePercent className="h-3.5 w-3.5" /> Secure deposit checkout
                      </div>
                    </PaymentOptionCard>

                    <PaymentOptionCard
                      title="Credit / Debit Card"
                      description="Charge the full order total instantly through Paymob using Visa or Mastercard."
                      badge="Visa + Mastercard"
                      icon={<CreditCard className="h-7 w-7 text-ink-900" />}
                      selected={paymentMethod === 'card'}
                      onSelect={() => setPaymentMethod('card')}
                      accent="ink"
                    >
                      <div className="mt-4 flex items-center gap-3">
                        <VisaMark />
                        <MastercardMark />
                      </div>
                    </PaymentOptionCard>
                  </div>

                  <div className="mt-6 rounded-2xl border border-ink-100 bg-cream/60 p-4 text-sm text-ink-600">
                    {paymentMethod === 'cash_on_delivery'
                      ? 'A 20% deposit will be charged securely now. Your order status will change to Awaiting COD after successful verification.'
                      : 'Your full order amount will be charged securely now. After verification, the order status will change to Paid.'}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button onClick={prev} className="btn-ghost">Back</button>
                    <button onClick={submitPayment} disabled={submitting || items.length === 0} className="btn-gold flex-1">
                      <Lock className="h-4 w-4" />
                      {submitting ? 'Redirecting to Paymob…' : paymentMethod === 'cash_on_delivery' ? 'Pay 20% Deposit via Paymob' : 'Pay Full Amount via Paymob'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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

function PaymentOptionCard({
  title,
  description,
  badge,
  icon,
  selected,
  onSelect,
  accent,
  children,
}: {
  title: string;
  description: string;
  badge: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  accent: 'amber' | 'ink';
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={classNames(
        'text-left rounded-3xl border p-5 transition focus:outline-none',
        selected
          ? accent === 'amber'
            ? 'border-amber-400 bg-amber-50 shadow-[0_18px_40px_rgba(180,83,9,0.10)]'
            : 'border-ink-900 bg-ink-50 shadow-[0_18px_40px_rgba(17,24,39,0.10)]'
          : 'border-ink-200 bg-warmwhite hover:border-ink-300 hover:shadow-luxe-sm',
      )}
    >
      <div className="flex items-start gap-4">
        <div className={classNames('flex h-12 w-12 items-center justify-center rounded-2xl', accent === 'amber' ? 'bg-amber-100' : 'bg-ink-100')}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-medium text-ink-900">{title}</h3>
            <span className={classNames('rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]', accent === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-ink-100 text-ink-700')}>
              {badge}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-ink-600">{description}</p>
          {children}
        </div>
      </div>
      <div className={classNames('mt-5 flex h-5 w-5 items-center justify-center rounded-full border', selected ? 'border-current' : 'border-ink-300')}>
        {selected && <div className={classNames('h-2.5 w-2.5 rounded-full', accent === 'amber' ? 'bg-amber-600' : 'bg-ink-900')} />}
      </div>
    </motion.button>
  );
}

function VisaMark() {
  return (
    <div className="flex h-10 w-20 items-center justify-center rounded-xl border border-[#1A1F71]/20 bg-white px-3 text-sm font-black tracking-[0.2em] text-[#1A1F71] shadow-sm">
      VISA
    </div>
  );
}

function MastercardMark() {
  return (
    <div className="flex h-10 w-28 items-center justify-center rounded-xl border border-ink-200 bg-white px-3 shadow-sm">
      <div className="relative mr-2 h-5 w-8">
        <span className="absolute left-0 top-0 h-5 w-5 rounded-full bg-[#EB001B] opacity-90" />
        <span className="absolute left-3 top-0 h-5 w-5 rounded-full bg-[#F79E1B] opacity-90" />
      </div>
      <span className="text-[11px] font-semibold tracking-[0.18em] text-ink-700">Mastercard</span>
    </div>
  );
}
