import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, AlertTriangle, ArrowUpRight, Star } from 'lucide-react';
import { supabase } from '../../models/supabase';
import { formatPrice, classNames } from '../../models/utils';

const ADMIN_DATA_CHANGED_EVENT = 'luxelayer:admin-data-changed';

interface Stats {
  revenue: number;
  orders: number;
  products: number;
  customers: number;
  lowStock: { id: string; name: string; stock: number; featured_image_url: string | null }[];
  topProducts: { name: string; total: number; qty: number; image: string | null }[];
  recentOrders: { order_number: string; email: string; total: number; status: string; created_at: string }[];
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
      if (!error && data) {
        const payload = data as Partial<Stats>;
        setStats({
          revenue: Number(payload.revenue ?? 0),
          orders: Number(payload.orders ?? 0),
          products: Number(payload.products ?? 0),
          customers: Number(payload.customers ?? 0),
          lowStock: Array.isArray(payload.lowStock) ? payload.lowStock : [],
          topProducts: Array.isArray(payload.topProducts) ? payload.topProducts : [],
          recentOrders: Array.isArray(payload.recentOrders) ? payload.recentOrders : [],
        });
        return;
      }

      const [ordersCount, revenueOrders, productsCount, customersCount, lowStock, recentOrders] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total, status, payment_status'),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_admin', false),
        supabase.from('products').select('id, name, stock, featured_image_url').lt('stock', 10).eq('is_published', true).order('stock', { ascending: true }).limit(5),
        supabase.from('orders').select('order_number, email, total, status, created_at').order('created_at', { ascending: false }).limit(6),
      ]);

      const revenue = (revenueOrders.data ?? []).reduce((sum: number, o: { total: number; status?: string; payment_status?: string }) => {
        const isRevenueOrder = o.payment_status === 'paid' || o.payment_status === 'deposit_paid' || o.status === 'delivered';
        return isRevenueOrder ? sum + Number(o.total) : sum;
      }, 0);

      const { data: topItems } = await supabase.from('order_items').select('name, quantity, total, image_url');
      const productMap = new Map<string, { name: string; total: number; qty: number; image: string | null }>();
      (topItems ?? []).forEach((it: { name: string; quantity: number; total: number; image_url: string | null }) => {
        const existing = productMap.get(it.name);
        if (existing) {
          existing.qty += it.quantity;
          existing.total += Number(it.total);
        } else {
          productMap.set(it.name, { name: it.name, qty: it.quantity, total: Number(it.total), image: it.image_url });
        }
      });

      setStats({
        revenue,
        orders: ordersCount.count ?? 0,
        products: productsCount.count ?? 0,
        customers: customersCount.count ?? 0,
        lowStock: lowStock.data ?? [],
        topProducts: [...productMap.values()].sort((a, b) => b.qty - a.qty).slice(0, 5),
        recentOrders: recentOrders.data ?? [],
      });
    } catch (err) {
      console.error('Admin stats error', err);
      setStats({
        revenue: 0,
        orders: 0,
        products: 0,
        customers: 0,
        lowStock: [],
        topProducts: [],
        recentOrders: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const refresh = () => load();
    window.addEventListener('focus', refresh);
    window.addEventListener(ADMIN_DATA_CHANGED_EVENT, refresh as EventListener);
    const intervalId = window.setInterval(refresh, 15000);
    const channel = supabase
      .channel('admin-dashboard-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, refresh)
      .subscribe();
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener(ADMIN_DATA_CHANGED_EVENT, refresh as EventListener);
      window.clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [load]);

  if (loading || !stats) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-champagne-300 border-t-champagne-500" /></div>;
  }

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats.revenue), icon: DollarSign, change: '+12.5%', positive: true },
    { label: 'Orders', value: stats.orders.toLocaleString(), icon: ShoppingBag, change: '+8.2%', positive: true },
    { label: 'Products', value: stats.products.toLocaleString(), icon: Package, change: '+3', positive: true },
    { label: 'Customers', value: stats.customers.toLocaleString(), icon: Users, change: '+15.3%', positive: true },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl bg-warmwhite p-5 ring-1 ring-ink-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-champagne-600">
                <s.icon className="h-5 w-5" />
              </div>
              <span className={classNames('flex items-center gap-0.5 text-xs font-medium', s.positive ? 'text-emerald-600' : 'text-rose-600')}>
                <TrendingUp className="h-3 w-3" /> {s.change}
              </span>
            </div>
            <p className="mt-4 font-display text-2xl font-semibold text-ink-900">{s.value}</p>
            <p className="text-xs text-ink-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue chart placeholder */}
        <div className="lg:col-span-2 rounded-2xl bg-warmwhite p-6 ring-1 ring-ink-200">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-display text-lg font-medium text-ink-900">Revenue Overview</h3>
            <select className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs text-ink-700">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>This year</option>
            </select>
          </div>
          <div className="flex h-48 items-end gap-2">
            {[42, 58, 35, 72, 48, 65, 80, 55, 70, 88, 62, 95].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 rounded-t-lg bg-gradient-to-t from-champagne-400 to-gold-500"
                title={`Week ${i + 1}`}
              />
            ))}
          </div>
          <div className="mt-3 flex justify-between text-[10px] text-ink-400">
            {['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'].map((w) => <span key={w}>{w}</span>)}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="rounded-2xl bg-warmwhite p-6 ring-1 ring-ink-200">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-medium text-ink-900">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Low Stock
          </h3>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-ink-500">All products well stocked.</p>
          ) : (
            <ul className="space-y-3">
              {stats.lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <img src={p.featured_image_url ?? ''} alt="" className="h-10 w-9 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{p.name}</p>
                    <p className="text-xs text-ink-500">{p.stock} left</p>
                  </div>
                  <span className={classNames('rounded-full px-2 py-0.5 text-[10px] font-semibold', p.stock <= 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700')}>
                    {p.stock <= 0 ? 'Out' : 'Low'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-2xl bg-warmwhite p-6 ring-1 ring-ink-200">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-medium text-ink-900">Recent Orders</h3>
            <Link to="/admin?tab=orders" className="flex items-center gap-1 text-xs font-medium text-champagne-700 hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-ink-500">No orders yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.recentOrders.map((o) => (
                <li key={o.order_number} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-ink-900">{o.order_number}</p>
                    <p className="truncate text-xs text-ink-500">{o.email}</p>
                  </div>
                  <span className="text-sm font-medium text-ink-900">{formatPrice(o.total)}</span>
                  <span className={classNames('rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize', o.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700')}>
                    {o.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top products */}
        <div className="rounded-2xl bg-warmwhite p-6 ring-1 ring-ink-200">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-medium text-ink-900">
            <Star className="h-4 w-4 fill-champagne-400 text-champagne-400" /> Top Products
          </h3>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-ink-500">No sales data yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream text-xs font-semibold text-ink-700">{i + 1}</span>
                  {p.image && <img src={p.image} alt="" className="h-10 w-9 rounded-lg object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{p.name}</p>
                    <p className="text-xs text-ink-500">{p.qty} sold</p>
                  </div>
                  <span className="text-sm font-medium text-ink-900">{formatPrice(p.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
