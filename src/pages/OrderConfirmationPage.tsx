import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Package, Truck, Home, ArrowRight, Copy } from 'lucide-react';
import type { Order } from '../types';
import { supabase } from '../models/supabase';
import { useToast } from '../controllers/ToastContext';
import { formatPrice } from '../models/utils';

export function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) return;
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', orderNumber)
      .maybeSingle()
      .then(({ data }) => {
        setOrder(data as Order | null);
        setLoading(false);
      });
  }, [orderNumber]);

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
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
          >
            <Check className="h-10 w-10 text-emerald-600" strokeWidth={2.5} />
          </motion.div>
          <h1 className="mt-6 font-display text-display-md font-medium text-ink-900">Thank You</h1>
          <p className="mt-2 text-sm text-ink-600">
            Your order has been confirmed. A confirmation email is on its way to {order.email}.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2">
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
        </motion.div>

        {/* Tracking */}
        <div className="mx-auto mt-12 max-w-3xl">
          <div className="flex items-center justify-between rounded-3xl bg-warmwhite p-6 shadow-luxe-sm ring-1 ring-ink-100">
            {[
              { icon: Check, label: 'Confirmed', done: true },
              { icon: Package, label: 'Processing', done: false },
              { icon: Truck, label: 'Shipped', done: false },
              { icon: Home, label: 'Delivered', done: false },
            ].map((s, i) => (
              <div key={s.label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full ${s.done ? 'bg-emerald-500 text-warmwhite' : 'bg-ink-100 text-ink-400'}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs font-medium ${s.done ? 'text-ink-900' : 'text-ink-400'}`}>{s.label}</span>
                </div>
                {i < 3 && <div className={`mx-2 h-px flex-1 ${s.done ? 'bg-emerald-500' : 'bg-ink-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="mx-auto mt-8 max-w-3xl rounded-3xl bg-warmwhite p-6 shadow-luxe-sm ring-1 ring-ink-100">
          <h2 className="mb-4 font-display text-lg font-medium text-ink-900">Order Details</h2>
          <ul className="space-y-4">
            {order.order_items?.map((item) => (
              <li key={item.id} className="flex items-center gap-4">
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
          <dl className="mt-5 space-y-2 border-t border-ink-100 pt-5 text-sm">
            <div className="flex justify-between"><dt className="text-ink-600">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Discount</dt><dd>-{formatPrice(order.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-ink-600">Shipping</dt><dd>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-600">Tax</dt><dd>{formatPrice(order.tax)}</dd></div>
            <div className="flex justify-between border-t border-ink-100 pt-2"><dt className="font-display text-base">Total</dt><dd className="font-display text-lg font-semibold">{formatPrice(order.total)}</dd></div>
          </dl>
        </div>

        <div className="mt-8 text-center">
          <Link to="/shop" className="btn-primary">
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
