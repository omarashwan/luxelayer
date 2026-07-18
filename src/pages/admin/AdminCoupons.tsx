import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, X, Save, Ticket, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import type { Coupon } from '../../types';
import { classNames, formatPrice } from '../../lib/utils';

export function AdminCoupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons((data as Coupon[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onDelete = async (c: Coupon) => {
    if (!confirm(`Delete coupon "${c.code}"?`)) return;
    const { error } = await supabase.from('coupons').delete().eq('id', c.id);
    if (error) toast(error.message, 'error');
    else { toast('Coupon deleted'); load(); }
  };

  const onSave = async (data: Partial<Coupon>) => {
    const payload = { ...data, code: (data.code ?? '').toUpperCase() };
    const { error } = await supabase.from('coupons').insert(payload);
    if (error) { toast(error.message, 'error'); return; }
    toast('Coupon created');
    setShowForm(false);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> Add Coupon
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-warmwhite ring-1 ring-ink-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Min Purchase</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-ink-400">Loading…</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-ink-400">No coupons yet</td></tr>
            ) : coupons.map((c) => (
              <tr key={c.id} className="hover:bg-ink-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-ink-900">{c.code}</span>
                    <button onClick={() => { navigator.clipboard.writeText(c.code); toast('Copied'); }} className="text-ink-400 hover:text-ink-700"><Copy className="h-3.5 w-3.5" /></button>
                  </div>
                  {c.description && <p className="text-xs text-ink-500">{c.description}</p>}
                </td>
                <td className="px-4 py-3 capitalize text-ink-700">{c.discount_type.replace('_', ' ')}</td>
                <td className="px-4 py-3 font-medium text-ink-900">
                  {c.discount_type === 'percentage' ? `${c.discount_value}%` : c.discount_type === 'fixed' ? formatPrice(c.discount_value) : 'Free Ship'}
                </td>
                <td className="px-4 py-3 text-ink-700">{c.min_purchase > 0 ? formatPrice(c.min_purchase) : '—'}</td>
                <td className="px-4 py-3 text-ink-700">{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</td>
                <td className="px-4 py-3">
                  <span className={classNames('rounded-full px-2 py-0.5 text-xs font-semibold', c.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-ink-100 text-ink-500')}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onDelete(c)} className="rounded-lg p-2 text-ink-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showForm && <CouponForm onClose={() => setShowForm(false)} onSave={onSave} />}
      </AnimatePresence>
    </div>
  );
}

function CouponForm({ onClose, onSave }: { onClose: () => void; onSave: (d: Partial<Coupon>) => void }) {
  const [form, setForm] = useState({
    code: '', description: '', discount_type: 'percentage' as Coupon['discount_type'],
    discount_value: 10, min_purchase: 0, max_uses: '' as string | number, expires_at: '', is_active: true,
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.form initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onSubmit={(e) => { e.preventDefault(); onSave({ ...form, max_uses: form.max_uses === '' ? null : Number(form.max_uses), expires_at: form.expires_at || null }); }} className="w-full max-w-lg rounded-3xl bg-warmwhite p-7 shadow-luxe-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-medium text-ink-900"><Ticket className="h-5 w-5 text-champagne-600" /> New Coupon</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-ink-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <div><label className="label-luxe">Code</label><input required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SUMMER25" className="input-luxe uppercase" /></div>
          <div><label className="label-luxe">Description</label><input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-luxe" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-luxe">Type</label>
              <select value={form.discount_type} onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as Coupon['discount_type'] }))} className="input-luxe">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
            <div><label className="label-luxe">Value</label><input type="number" step="0.01" value={form.discount_value} onChange={(e) => setForm((f) => ({ ...f, discount_value: Number(e.target.value) }))} className="input-luxe" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label-luxe">Min Purchase ($)</label><input type="number" step="0.01" value={form.min_purchase} onChange={(e) => setForm((f) => ({ ...f, min_purchase: Number(e.target.value) }))} className="input-luxe" /></div>
            <div><label className="label-luxe">Max Uses</label><input type="number" value={form.max_uses} onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))} placeholder="unlimited" className="input-luxe" /></div>
          </div>
          <div><label className="label-luxe">Expires At</label><input type="date" value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))} className="input-luxe" /></div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-200 p-3 text-sm has-[:checked]:border-champagne-500 has-[:checked]:bg-champagne-50">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="peer sr-only" />
            <span className="flex h-5 w-5 items-center justify-center rounded-md border border-ink-300 peer-checked:border-champagne-500 peer-checked:bg-champagne-500 peer-checked:text-warmwhite">✓</span>
            Active
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1"><Save className="h-4 w-4" /> Create</button>
        </div>
      </motion.form>
    </motion.div>
  );
}
