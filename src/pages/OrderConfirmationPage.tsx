import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Copy, Home, Package, ShoppingBag, Truck, BadgeCheck } from 'lucide-react';
import type { Order } from '../types';
import { supabase } from '../models/supabase';
import { useToast } from '../controllers/ToastContext';
import { useCart } from '../controllers/CartContext';
import { formatPrice } from '../models/utils';

type PaymentOrder = Omit<Order, 'status' | 'payment_status'> & {
  status: string;
  payment_status: string;
};

export function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearedCart, setClearedCart] = useState(false);

  const paymentSuccess = useMemo(() => new URLSearchParams(location.search).get('payment') === 'success', [location.search]);
  const isPaid = order?.payment_status === 'paid' || order?.payment_status === 'deposit_paid' || order?.status === 'paid' || order?.status === 'awaiting_cod';
  const successState = paymentSuccess || isPaid;

  useEffect(() => {
    if (!orderNumber) return;
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', orderNumber)
      .maybeSingle()
      .then(({ data }) => {
        setOrder(data as PaymentOrder | null);
        setLoading(false);
      });
  }, [orderNumber]);

  useEffect(() => {
    if (successState && order && !clearedCart) {
      clearCart();
      setClearedCart(true);
      try {
        window.sessionStorage.removeItem('luxelayer.checkout.draft.v1');
      } catch {
        // ignore
      }
    }
  }, [successState, order, clearedCart, clearCart]);

  const estimatedDelivery = useMemo(() => {
    const method = String(order?.shipping_method || 'standard');
    if (method === 'express') return '2 business days';
    if (method === 'overnight') return '1 business day';
    return '3-5 business days';
  }, [order?.shipping_method]);

  if (loading) {
    return (
      <div className="container-luxe flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-champagne-300 border-t-champagne-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-luxe flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="font-display text-3xl text-ink-900">Order not found</p>
        <Link to="/shop" className="btn-primary mt-6">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="bg-ivory">
      <div className="container-luxe py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          <div className="rounded-[2rem] border border-ink-100 bg-warmwhite p-8 shadow-luxe-sm">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 180 }}
                className={successState ? 'mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100' : 'mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-ink-100'}
              >
                {successState ? <Check className="h-10 w-10 text-emerald-600" strokeWidth={2.5} /> : <Package className="h-9 w-9 text-ink-500" strokeWidth={2.2} />}
              </motion.div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.26em] text-ink-500">
                {successState ? 'Payment Confirmed' : 'Order Received'}
              </p>
              <h1 className="mt-3 font-display text-display-md font-medium text-ink-900">
                {successState ? 'Your order has been placed successfully.' : 'Your order is being prepared.'}
              </h1>
              <p className="mt-3 text-sm text-ink-600">
                {successState
                  ? `Thank you for your purchase. A confirmation has been sent to ${order.email}. You can track delivery progress from your order status page at any time.`
                  : `We have received your order ${order.order_number}.`}
              </p>

              <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-cream px-4 py-2">
                <span className="text-xs font-medium uppercase tracking-wider text-ink-500">Order #</span>
                <span className="font-mono text-sm font-semibold text-ink-900">{order.order_number}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(order.order_number);
                    toast('Order number copied');
                  }}
                  className="text-ink-400 hover:text-ink-700"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-3xl bg-ivory p-6 ring-1 ring-ink-100">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">Payment Summary</p>
                    <h2 className="mt-2 font-display text-2xl font-medium text-ink-900">{successState ? 'Payment verified' : 'Awaiting payment confirmation'}</h2>
                  </div>
                  <div className={successState ? 'rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700' : 'rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700'}>
                    {order.payment_status === 'deposit_paid' ? 'Deposit Paid' : order.payment_status === 'paid' ? 'Paid' : order.payment_status}
                  </div>
                </div>

                <dl className="mt-6 space-y-3 text-sm">
                  <DetailRow label="Customer Name" value={`${order.shipping_first_name || ''} ${order.shipping_last_name || ''}`.trim() || order.email} />
                  <DetailRow label="Products Purchased" value={`${order.order_items?.length ?? 0} item(s)`} />
                  <DetailRow label="Subtotal" value={formatPrice(order.subtotal)} />
                  <DetailRow label="Shipping" value={order.shipping === 0 ? 'Free' : formatPrice(order.shipping)} />
                  <DetailRow label="Total" value={formatPrice(order.total)} strong />
                  <DetailRow label="Payment Method" value={order.payment_method || 'Paymob'} />
                  <DetailRow label="Payment Status" value={prettyPaymentStatus(order.payment_status)} strong={successState} />
                  <DetailRow label="Estimated Delivery" value={estimatedDelivery} />
                </dl>
              </section>

              <aside className="rounded-3xl bg-warmwhite p-6 ring-1 ring-ink-100">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">Order Timeline</p>
                <div className="mt-5 space-y-4">
                  {[
                    { icon: BadgeCheck, label: 'Payment verified', done: successState },
                    { icon: Package, label: 'Processing order', done: order.status === 'processing' || order.status === 'paid' || order.status === 'awaiting_cod' },
                    { icon: Truck, label: 'Out for delivery', done: false },
                    { icon: Home, label: 'Delivered', done: false },
                  ].map((item, index) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${item.done ? 'bg-emerald-500 text-warmwhite' : 'bg-ink-100 text-ink-400'}`}>
                        <item.icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={`text-sm font-medium ${item.done ? 'text-ink-900' : 'text-ink-500'}`}>{item.label}</p>
                        {index === 0 && successState && <p className="mt-1 text-xs text-ink-500">Verified through Paymob and recorded in LuxeLayer.</p>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-cream p-4 text-sm text-ink-600">
                  {successState
                    ? 'Payment is securely verified and your order is now in processing. Use View Order Status for live updates.'
                    : 'Refresh if needed while the payment confirmation is being processed.'}
                </div>
              </aside>
            </div>

            <section className="mt-6 rounded-3xl border border-ink-100 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-medium text-ink-900">Products Purchased</h2>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">{order.order_items?.length ?? 0} items</span>
              </div>
              <ul className="mt-5 space-y-4">
                {order.order_items?.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 rounded-2xl bg-ivory p-3">
                    <img src={item.image_url ?? ''} alt={item.name} className="h-16 w-14 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-900">{item.name}</p>
                      {(item.shade || item.size) && (
                        <p className="text-xs text-ink-500">{item.shade}{item.shade && item.size && ' · '}{item.size}</p>
                      )}
                      <p className="text-xs text-ink-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-ink-900">{formatPrice(item.total)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/account?tab=orders" className="btn-primary flex items-center gap-2">
                <Package className="h-4 w-4" /> View Order Status
              </Link>
              <Link to="/order/${encodeURIComponent(order.order_number)}" className="btn-ghost flex items-center gap-2">
                Order Summary <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/shop" className="btn-ghost flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Continue Shopping
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink-100 pb-3 last:border-0 last:pb-0">
      <dt className="text-ink-500">{label}</dt>
      <dd className={strong ? 'text-right font-semibold text-ink-900' : 'text-right text-ink-800'}>{value}</dd>
    </div>
  );
}

function prettyPaymentStatus(status: string) {
  if (status === 'deposit_paid') return 'Deposit Paid';
  if (status === 'paid') return 'Paid';
  if (status === 'failed') return 'Failed';
  if (status === 'refunded') return 'Refunded';
  return 'Unpaid';
}
