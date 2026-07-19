import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Heart, MapPin, Settings, Bell, Star, Truck, Check, LogOut, Plus, Trash2, Eye, EyeOff,
} from 'lucide-react';
import { useAuth } from '../controllers/AuthContext';
import { useWishlist } from '../controllers/WishlistContext';
import { useToast } from '../controllers/ToastContext';
import { supabase } from '../models/supabase';
import { fetchProductsByIds } from '../models/api';
import type { Address, Notification, Order, Product } from '../types';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { classNames, formatPrice, timeAgo, initials } from '../models/utils';

type Tab = 'orders' | 'wishlist' | 'addresses' | 'notifications' | 'settings';

const TABS: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AccountPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile, session, signOut, refreshProfile } = useAuth();
  const { productIds } = useWishlist();
  const { toast } = useToast();
  const tab = (params.get('tab') as Tab) ?? 'orders';
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState<Omit<Address, 'id' | 'user_id' | 'created_at'>>({
    label: '', first_name: '', last_name: '', address1: '', address2: null, city: '', state: '', postal_code: '', country: 'United States', phone: null, is_default: false,
  });

  const setTab = (t: Tab) => setParams({ tab: t });

  const loadOrders = useCallback(async () => {
    if (!session?.user) return;
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    setOrders((data as Order[]) ?? []);
  }, [session?.user]);

  const loadAddresses = useCallback(async () => {
    if (!session?.user) return;
    const { data } = await supabase.from('addresses').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
    setAddresses((data as Address[]) ?? []);
  }, [session?.user]);

  const loadNotifications = useCallback(async () => {
    if (!session?.user) return;
    const { data } = await supabase.from('notifications').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(20);
    setNotifications((data as Notification[]) ?? []);
  }, [session?.user]);

  useEffect(() => {
    if (productIds.size > 0) {
      fetchProductsByIds([...productIds]).then(setWishlistProducts).catch(() => setWishlistProducts([]));
    } else {
      setWishlistProducts([]);
    }
  }, [productIds]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadOrders(), loadAddresses(), loadNotifications()]).finally(() => setLoading(false));
  }, [loadOrders, loadAddresses, loadNotifications]);

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    const { error } = await supabase.from('addresses').insert({ ...addrForm, user_id: session.user.id });
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Address saved');
      setShowAddrForm(false);
      setAddrForm({ label: '', first_name: '', last_name: '', address1: '', address2: null, city: '', state: '', postal_code: '', country: 'United States', phone: null, is_default: false });
      loadAddresses();
    }
  };

  const deleteAddress = async (id: string) => {
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) toast(error.message, 'error');
    else {
      toast('Address removed');
      loadAddresses();
    }
  };

  const markNotificationRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    loadNotifications();
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const { error } = await supabase.from('profiles').update({
      first_name: fd.get('first_name') as string,
      last_name: fd.get('last_name') as string,
      phone: fd.get('phone') as string,
    }).eq('id', session!.user.id);
    if (error) toast(error.message, 'error');
    else {
      toast('Profile updated');
      refreshProfile();
    }
  };

  return (
    <div className="bg-ivory">
      <div className="border-b border-ink-100 bg-warmwhite">
        <div className="container-luxe py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-champagne-400 to-gold-500 font-display text-xl font-semibold text-ink-900">
              {initials(profile?.first_name, profile?.last_name)}
            </div>
            <div>
              <h1 className="font-display text-display-md font-medium text-ink-900">
                {profile?.first_name ? `${profile.first_name} ${profile.last_name ?? ''}` : 'My Account'}
              </h1>
              <p className="text-sm text-ink-500">{profile?.email}</p>
            </div>
            {profile?.is_admin && (
              <Link to="/admin" className="ml-auto btn-outline text-sm">Admin Dashboard</Link>
            )}
          </div>
        </div>
      </div>

      <div className="container-luxe py-10">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside>
            <div className="sticky top-28 space-y-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={classNames(
                    'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                    tab === t.id ? 'bg-ink-900 text-warmwhite' : 'text-ink-700 hover:bg-cream',
                  )}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
              <button
                onClick={() => { signOut(); navigate('/'); }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink-700 transition hover:bg-cream"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </aside>

          {/* Content */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {tab === 'orders' && (
                  <div>
                    <h2 className="mb-6 font-display text-xl font-medium text-ink-900">Order History</h2>
                    {loading ? (
                      <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
                    ) : orders.length === 0 ? (
                      <EmptyState icon={Package} title="No orders yet" sub="Your orders will appear here." cta="Start Shopping" to="/shop" />
                    ) : (
                      <div className="space-y-4">
                        {orders.map((o) => (
                          <Link key={o.id} to={`/order/${o.order_number}`} className="block rounded-2xl bg-warmwhite p-5 ring-1 ring-ink-100 transition hover:shadow-luxe">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="font-mono text-sm font-semibold text-ink-900">{o.order_number}</p>
                                <p className="text-xs text-ink-500">{timeAgo(o.created_at)} · {o.order_items?.length ?? 0} items</p>
                              </div>
                              <StatusBadge status={o.status} />
                              <span className="font-display text-lg font-medium text-ink-900">{formatPrice(o.total)}</span>
                            </div>
                            {o.order_items && o.order_items.length > 0 && (
                              <div className="mt-4 flex gap-2">
                                {o.order_items.slice(0, 5).map((it) => (
                                  <img key={it.id} src={it.image_url ?? ''} alt={it.name} className="h-12 w-10 rounded-lg object-cover" />
                                ))}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'wishlist' && (
                  <div>
                    <h2 className="mb-6 font-display text-xl font-medium text-ink-900">My Wishlist</h2>
                    {wishlistProducts.length === 0 ? (
                      <EmptyState icon={Heart} title="Your wishlist is empty" sub="Save your favorites for later." cta="Discover Products" to="/shop" />
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {wishlistProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'addresses' && (
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="font-display text-xl font-medium text-ink-900">Saved Addresses</h2>
                      <button onClick={() => setShowAddrForm((s) => !s)} className="btn-outline text-sm">
                        <Plus className="h-4 w-4" /> Add
                      </button>
                    </div>
                    <AnimatePresence>
                      {showAddrForm && (
                        <motion.form
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          onSubmit={saveAddress} className="mb-6 overflow-hidden rounded-2xl bg-cream/70 p-5"
                        >
                          <div className="grid gap-4 sm:grid-cols-2">
                            <input required placeholder="Label (e.g. Home)" value={addrForm.label ?? ''} onChange={(e) => setAddrForm((a) => ({ ...a, label: e.target.value }))} className="input-luxe sm:col-span-2" />
                            <input required placeholder="First name" value={addrForm.first_name} onChange={(e) => setAddrForm((a) => ({ ...a, first_name: e.target.value }))} className="input-luxe" />
                            <input required placeholder="Last name" value={addrForm.last_name} onChange={(e) => setAddrForm((a) => ({ ...a, last_name: e.target.value }))} className="input-luxe" />
                            <input required placeholder="Address" value={addrForm.address1} onChange={(e) => setAddrForm((a) => ({ ...a, address1: e.target.value }))} className="input-luxe sm:col-span-2" />
                            <input placeholder="Apt, suite" value={addrForm.address2 ?? ''} onChange={(e) => setAddrForm((a) => ({ ...a, address2: e.target.value }))} className="input-luxe sm:col-span-2" />
                            <input required placeholder="City" value={addrForm.city} onChange={(e) => setAddrForm((a) => ({ ...a, city: e.target.value }))} className="input-luxe" />
                            <input placeholder="State" value={addrForm.state ?? ''} onChange={(e) => setAddrForm((a) => ({ ...a, state: e.target.value }))} className="input-luxe" />
                            <input required placeholder="Postal code" value={addrForm.postal_code} onChange={(e) => setAddrForm((a) => ({ ...a, postal_code: e.target.value }))} className="input-luxe" />
                            <input placeholder="Phone" value={addrForm.phone ?? ''} onChange={(e) => setAddrForm((a) => ({ ...a, phone: e.target.value }))} className="input-luxe" />
                          </div>
                          <button type="submit" className="btn-primary mt-4">Save Address</button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                    {addresses.length === 0 ? (
                      <EmptyState icon={MapPin} title="No saved addresses" sub="Add an address for faster checkout." />
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {addresses.map((a) => (
                          <div key={a.id} className="rounded-2xl bg-warmwhite p-5 ring-1 ring-ink-100">
                            <div className="flex items-start justify-between">
                              <div>
                                {a.label && <p className="text-xs font-semibold uppercase tracking-wider text-champagne-600">{a.label}</p>}
                                <p className="mt-1 text-sm text-ink-800">{a.first_name} {a.last_name}</p>
                                <p className="text-sm text-ink-600">{a.address1}{a.address2 && `, ${a.address2}`}</p>
                                <p className="text-sm text-ink-600">{a.city}, {a.state} {a.postal_code}</p>
                                <p className="text-sm text-ink-600">{a.country}</p>
                              </div>
                              <button onClick={() => deleteAddress(a.id)} className="text-ink-400 hover:text-rose-600">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'notifications' && (
                  <div>
                    <h2 className="mb-6 font-display text-xl font-medium text-ink-900">Notifications</h2>
                    {notifications.length === 0 ? (
                      <EmptyState icon={Bell} title="No notifications" sub="Order updates and alerts will show here." />
                    ) : (
                      <div className="space-y-2">
                        {notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => !n.is_read && markNotificationRead(n.id)}
                            className={classNames('flex w-full items-start gap-3 rounded-2xl p-4 text-left transition', n.is_read ? 'bg-cream/50' : 'bg-warmwhite ring-1 ring-champagne-200')}
                          >
                            <div className={classNames('mt-0.5 h-2 w-2 rounded-full', n.is_read ? 'bg-ink-200' : 'bg-champagne-500')} />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-ink-900">{n.title}</p>
                              {n.body && <p className="text-xs text-ink-600">{n.body}</p>}
                              <p className="mt-1 text-xs text-ink-400">{timeAgo(n.created_at)}</p>
                            </div>
                            {!n.is_read && <Eye className="h-4 w-4 text-ink-400" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'settings' && (
                  <div>
                    <h2 className="mb-6 font-display text-xl font-medium text-ink-900">Profile Settings</h2>
                    <form onSubmit={updateProfile} className="max-w-md space-y-4 rounded-2xl bg-warmwhite p-6 ring-1 ring-ink-100">
                      <div>
                        <label className="label-luxe">First Name</label>
                        <input name="first_name" defaultValue={profile?.first_name ?? ''} className="input-luxe" />
                      </div>
                      <div>
                        <label className="label-luxe">Last Name</label>
                        <input name="last_name" defaultValue={profile?.last_name ?? ''} className="input-luxe" />
                      </div>
                      <div>
                        <label className="label-luxe">Email</label>
                        <input value={profile?.email ?? ''} disabled className="input-luxe opacity-60" />
                      </div>
                      <div>
                        <label className="label-luxe">Phone</label>
                        <input name="phone" defaultValue={profile?.phone ?? ''} className="input-luxe" />
                      </div>
                      <button type="submit" className="btn-primary w-full">Save Changes</button>
                    </form>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Order['status'] }) {
  const map = {
    pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
    processing: { label: 'Processing', cls: 'bg-blue-100 text-blue-700' },
    shipped: { label: 'Shipped', cls: 'bg-indigo-100 text-indigo-700' },
    delivered: { label: 'Delivered', cls: 'bg-emerald-100 text-emerald-700' },
    cancelled: { label: 'Cancelled', cls: 'bg-rose-100 text-rose-700' },
    refunded: { label: 'Refunded', cls: 'bg-ink-100 text-ink-700' },
    returned: { label: 'Returned', cls: 'bg-ink-100 text-ink-700' },
  } as const;
  const s = map[status] ?? map.pending;
  return <span className={classNames('rounded-full px-2.5 py-1 text-xs font-semibold', s.cls)}>{s.label}</span>;
}

function EmptyState({ icon: Icon, title, sub, cta, to }: { icon: typeof Package; title: string; sub: string; cta?: string; to?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-cream/50 py-16 text-center">
      <Icon className="h-10 w-10 text-ink-300" />
      <p className="mt-4 font-display text-lg text-ink-900">{title}</p>
      <p className="mt-1 text-sm text-ink-500">{sub}</p>
      {cta && to && <Link to={to} className="btn-primary mt-5">{cta}</Link>}
    </div>
  );
}
