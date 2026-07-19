import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../models/supabase';
import { useToast } from '../../controllers/ToastContext';
import type { Brand } from '../../types';
import { slugify } from '../../models/utils';

export function AdminBrands() {
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('brands').select('*').order('sort_order');
    setBrands((data as Brand[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onDelete = async (b: Brand) => {
    if (!confirm(`Delete "${b.name}"? Products will keep their data but lose the brand link.`)) return;
    const { error } = await supabase.from('brands').delete().eq('id', b.id);
    if (error) toast(error.message, 'error');
    else { toast('Brand deleted'); load(); }
  };

  const onSave = async (data: Partial<Brand>) => {
    if (editing) {
      const { error } = await supabase.from('brands').update({ ...data, slug: data.slug ? slugify(data.slug) : undefined }).eq('id', editing.id);
      if (error) { toast(error.message, 'error'); return; }
      toast('Brand updated');
    } else {
      const { error } = await supabase.from('brands').insert({ ...data, slug: slugify(data.slug ?? data.name ?? 'brand') });
      if (error) { toast(error.message, 'error'); return; }
      toast('Brand created');
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> Add Brand
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full text-center text-ink-400">Loading…</p>
        ) : brands.length === 0 ? (
          <p className="col-span-full text-center text-ink-400">No brands yet</p>
        ) : brands.map((b) => (
          <div key={b.id} className="overflow-hidden rounded-2xl bg-warmwhite ring-1 ring-ink-200">
            <div className="relative aspect-[16/9] bg-cream">
              {b.banner_url && <img src={b.banner_url} alt={b.name} className="h-full w-full object-cover" />}
              {b.logo_url && <img src={b.logo_url} alt="" className="absolute bottom-3 left-3 h-12 w-12 rounded-full object-cover ring-2 ring-warmwhite" />}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-base font-medium text-ink-900">{b.name}</h3>
                  {b.country && <p className="text-xs text-ink-500">{b.country}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(b); setShowForm(true); }} className="rounded-lg p-1.5 text-ink-500 hover:bg-cream"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => onDelete(b)} className="rounded-lg p-1.5 text-ink-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              {b.description && <p className="mt-2 line-clamp-2 text-xs text-ink-600">{b.description}</p>}
              {b.featured && <span className="mt-2 inline-block rounded-full bg-champagne-100 px-2 py-0.5 text-[10px] font-semibold text-champagne-700">Featured</span>}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && <BrandForm brand={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSave={onSave} />}
      </AnimatePresence>
    </div>
  );
}

function BrandForm({ brand, onClose, onSave }: { brand: Brand | null; onClose: () => void; onSave: (d: Partial<Brand>) => void }) {
  const [form, setForm] = useState({
    name: brand?.name ?? '',
    slug: brand?.slug ?? '',
    logo_url: brand?.logo_url ?? '',
    banner_url: brand?.banner_url ?? '',
    description: brand?.description ?? '',
    country: brand?.country ?? '',
    featured: brand?.featured ?? false,
    sort_order: brand?.sort_order ?? 0,
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.form initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="w-full max-w-lg rounded-3xl bg-warmwhite p-7 shadow-luxe-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-medium text-ink-900">{brand ? 'Edit Brand' : 'New Brand'}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-ink-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <div><label className="label-luxe">Name</label><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-luxe" /></div>
          <div><label className="label-luxe">Slug</label><input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto" className="input-luxe" /></div>
          <div><label className="label-luxe">Logo URL</label><input value={form.logo_url} onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))} className="input-luxe" /></div>
          <div><label className="label-luxe">Banner URL</label><input value={form.banner_url} onChange={(e) => setForm((f) => ({ ...f, banner_url: e.target.value }))} className="input-luxe" /></div>
          <div><label className="label-luxe">Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-luxe resize-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label-luxe">Country</label><input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className="input-luxe" /></div>
            <div><label className="label-luxe">Sort Order</label><input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} className="input-luxe" /></div>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-200 p-3 text-sm has-[:checked]:border-champagne-500 has-[:checked]:bg-champagne-50">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="peer sr-only" />
            <span className="flex h-5 w-5 items-center justify-center rounded-md border border-ink-300 peer-checked:border-champagne-500 peer-checked:bg-champagne-500 peer-checked:text-warmwhite">✓</span>
            Featured brand
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1"><Save className="h-4 w-4" /> Save</button>
        </div>
      </motion.form>
    </motion.div>
  );
}
