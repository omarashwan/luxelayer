import { useEffect, useState, useCallback } from 'react';
import { Search, Eye, Truck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import type { Order } from '../../types';
import { classNames, formatPrice, timeAgo } from '../../lib/utils';

const STATUS_OPTIONS: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned'];

export function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewing, setViewing] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (statusFilter) q = q.eq('status', statusFilter);
    const { data } = await q;
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter((o) =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase()),
  );

  const updateStatus = async (id: string, status: Order['status']) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast('Order status updated'); load(); if (viewing?.id === id) setViewing((v) => v ? { ...v, status } : null); }
  };

  const updateTracking = async (id: string, tracking: string) => {
    const { error } = await supabase.from('orders').update({ tracking_number: tracking }).eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast('Tracking number saved'); load(); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # or email…"
            className="w-72 rounded-xl border border-ink-200 bg-warmwhite py-2.5 pl-10 pr-4 text-sm focus:border-champagne-400 focus:outline-none"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-ink-200 bg-warmwhite px-4 py-2.5 text-sm">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl bg-warmwhite ring-1 ring-ink-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-ink-400">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-ink-400">No orders found</td></tr>
              ) : filtered.map((o) => (
                <tr key={o.id} className="transition hover:bg-ink-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-ink-900">{o.order_number}</td>
                  <td className="px-4 py-3 text-ink-700">{o.email}</td>
                  <td className="px-4 py-3 text-ink-500">{timeAgo(o.created_at)}</td>
                  <td className="px-4 py-3 font-medium text-ink-900">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value as Order['status'])}
                      className={classNames('rounded-full px-2.5 py-1 text-xs font-semibold capitalize border-0', statusClass(o.status))}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setViewing(o)} className="rounded-lg p-2 text-ink-500 hover:bg-cream hover:text-ink-900">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {viewing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-900/50 p-4 backdrop-blur-sm"
            onClick={() => setViewing(null)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="my-8 w-full max-w-2xl rounded-3xl bg-warmwhite p-7 shadow-luxe-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-medium text-ink-900">{viewing.order_number}</h2>
                  <p className="text-sm text-ink-500">{viewing.email} · {timeAgo(viewing.created_at)}</p>
                </div>
                <button onClick={() => setViewing(null)} className="rounded-full p-2 hover:bg-ink-100"><X className="h-5 w-5" /></button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-cream/60 p-4 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Shipping Address</p>
                  <p className="mt-2 text-ink-800">{viewing.shipping_first_name} {viewing.shipping_last_name}</p>
                  <p className="text-ink-600">{viewing.shipping_address1}</p>
                  <p className="text-ink-600">{viewing.shipping_city}, {viewing.shipping_state} {viewing.shipping_postal_code}</p>
                  <p className="text-ink-600">{viewing.shipping_country}</p>
                </div>
                <div className="rounded-2xl bg-cream/60 p-4 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Payment</p>
                  <p className="mt-2 text-ink-800 capitalize">{viewing.payment_method}</p>
                  <p className="text-ink-600 capitalize">{viewing.payment_status}</p>
                  {viewing.tracking_number && <p className="mt-2 flex items-center gap-1 text-ink-800"><Truck className="h-3.5 w-3.5" /> {viewing.tracking_number}</p>}
                </div>
              </div>

              {/* Items */}
              <div className="mt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Items</p>
                <ul className="space-y-3">
                  {viewing.order_items?.map((it) => (
                    <li key={it.id} className="flex items-center gap-3">
                      <img src={it.image_url ?? ''} alt="" className="h-12 w-10 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-ink-900">{it.name}</p>
                        <p className="text-xs text-ink-500">Qty {it.quantity} · {formatPrice(it.unit_price)}</p>
                      </div>
                      <span className="text-sm font-medium">{formatPrice(it.total)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Totals */}
              <dl className="mt-5 space-y-1.5 border-t border-ink-100 pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-ink-600">Subtotal</dt><dd>{formatPrice(viewing.subtotal)}</dd></div>
                {viewing.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Discount</dt><dd>-{formatPrice(viewing.discount)}</dd></div>}
                <div className="flex justify-between"><dt className="text-ink-600">Shipping</dt><dd>{formatPrice(viewing.shipping)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-600">Tax</dt><dd>{formatPrice(viewing.tax)}</dd></div>
                <div className="flex justify-between border-t border-ink-100 pt-2 font-display text-base font-semibold"><dt>Total</dt><dd>{formatPrice(viewing.total)}</dd></div>
              </dl>

              {/* Tracking input */}
              <div className="mt-5">
                <label className="label-luxe">Tracking Number</label>
                <div className="flex gap-2">
                  <input
                    defaultValue={viewing.tracking_number ?? ''}
                    placeholder="e.g. 1Z999AA10123456784"
                    className="input-luxe flex-1"
                    id="tracking-input"
                  />
                  <button
                    onClick={() => updateTracking(viewing.id, (document.getElementById('tracking-input') as HTMLInputElement).value)}
                    className="btn-primary text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function statusClass(status: Order['status']) {
  const map = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
    refunded: 'bg-ink-100 text-ink-700',
    returned: 'bg-ink-100 text-ink-700',
  } as const;
  return map[status] ?? 'bg-ink-100 text-ink-700';
}
