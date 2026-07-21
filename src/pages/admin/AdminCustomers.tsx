import { useEffect, useState, useCallback } from 'react';
import { Search, ShieldCheck, Trash2 } from 'lucide-react';
import { supabase } from '../../models/supabase';
import { useToast } from '../../controllers/ToastContext';
import { useAuth } from '../../controllers/AuthContext';
import type { Profile } from '../../types';
import { classNames, initials, timeAgo } from '../../models/utils';

const ADMIN_DATA_CHANGED_EVENT = 'luxelayer:admin-data-changed';

export function AdminCustomers() {
  const { toast } = useToast();
  const { profile: me } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const list = (data as Profile[]) ?? [];
    setProfiles(list);
    // Get order counts
    const { data: orders } = await supabase.from('orders').select('user_id');
    const counts: Record<string, number> = {};
    (orders ?? []).forEach((o: { user_id: string | null }) => {
      if (o.user_id) counts[o.user_id] = (counts[o.user_id] ?? 0) + 1;
    });
    setOrderCounts(counts);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleAdmin = async (p: Profile) => {
    const { error } = await supabase.from('profiles').update({ is_admin: !p.is_admin }).eq('id', p.id);
    if (error) toast(error.message, 'error');
    else { toast(`${p.first_name ?? p.email} ${p.is_admin ? 'demoted' : 'promoted to admin'}`); window.dispatchEvent(new CustomEvent(ADMIN_DATA_CHANGED_EVENT)); load(); }
  };

  const filtered = profiles.filter((p) =>
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers…" className="w-full rounded-xl border border-ink-200 bg-warmwhite py-2.5 pl-10 pr-4 text-sm focus:border-champagne-400 focus:outline-none" />
      </div>

      <div className="overflow-hidden rounded-2xl bg-warmwhite ring-1 ring-ink-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-ink-400">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-ink-400">No customers</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.id} className="hover:bg-ink-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-champagne-400 to-gold-500 text-xs font-semibold text-ink-900">{initials(p.first_name, p.last_name)}</div>
                    <div>
                      <p className="font-medium text-ink-900">{p.first_name} {p.last_name}</p>
                      <p className="text-xs text-ink-500">{p.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-500">{timeAgo(p.created_at)}</td>
                <td className="px-4 py-3 text-ink-700">{orderCounts[p.id] ?? 0}</td>
                <td className="px-4 py-3">
                  <span className={classNames('rounded-full px-2 py-0.5 text-xs font-semibold', p.is_admin ? 'bg-champagne-100 text-champagne-700' : 'bg-ink-100 text-ink-600')}>
                    {p.is_admin ? 'Admin' : 'Customer'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {p.id !== me?.id && (
                    <button onClick={() => toggleAdmin(p)} className="rounded-lg p-2 text-ink-500 hover:bg-cream hover:text-ink-900" title={p.is_admin ? 'Demote' : 'Promote to admin'}>
                      <ShieldCheck className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
