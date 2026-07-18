import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Save, FolderTree } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import type { Category } from '../../types';
import { slugify } from '../../lib/utils';

export function AdminCategories() {
  const { toast } = useToast();
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCats((data as Category[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onDelete = async (c: Category) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', c.id);
    if (error) toast(error.message, 'error');
    else { toast('Category deleted'); load(); }
  };

  const onSave = async (data: Partial<Category>) => {
    if (editing) {
      const { error } = await supabase.from('categories').update({ ...data, slug: data.slug ? slugify(data.slug) : undefined }).eq('id', editing.id);
      if (error) { toast(error.message, 'error'); return; }
      toast('Category updated');
    } else {
      const { error } = await supabase.from('categories').insert({ ...data, slug: slugify(data.slug ?? data.name ?? 'category') });
      if (error) { toast(error.message, 'error'); return; }
      toast('Category created');
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <p className="col-span-full text-center text-ink-400">Loading…</p>
        ) : cats.length === 0 ? (
          <p className="col-span-full text-center text-ink-400">No categories yet</p>
        ) : cats.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-2xl bg-warmwhite ring-1 ring-ink-200">
            <div className="relative aspect-[4/3] bg-cream">
              {c.image_url && <img src={c.image_url} alt={c.name} className="h-full w-full object-cover" />}
              <div className="absolute inset-0 flex items-center justify-center bg-ink-900/30 opacity-0 transition hover:opacity-100">
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(c); setShowForm(true); }} className="rounded-lg bg-warmwhite p-2 text-ink-800"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => onDelete(c)} className="rounded-lg bg-warmwhite p-2 text-rose-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-display text-sm font-medium text-ink-900">{c.name}</h3>
              {c.featured && <span className="mt-1 inline-block rounded-full bg-champagne-100 px-2 py-0.5 text-[10px] font-semibold text-champagne-700">Featured</span>}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && <CatForm cat={editing} cats={cats} onClose={() => { setShowForm(false); setEditing(null); }} onSave={onSave} />}
      </AnimatePresence>
    </div>
  );
}

function CatForm({ cat, cats, onClose, onSave }: { cat: Category | null; cats: Category[]; onClose: () => void; onSave: (d: Partial<Category>) => void }) {
  const [form, setForm] = useState({
    name: cat?.name ?? '',
    slug: cat?.slug ?? '',
    parent_id: cat?.parent_id ?? '',
    icon_name: cat?.icon_name ?? '',
    image_url: cat?.image_url ?? '',
    description: cat?.description ?? '',
    featured: cat?.featured ?? false,
    sort_order: cat?.sort_order ?? 0,
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.form initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onSubmit={(e) => { e.preventDefault(); onSave({ ...form, parent_id: form.parent_id || null }); }} className="w-full max-w-lg rounded-3xl bg-warmwhite p-7 shadow-luxe-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-medium text-ink-900"><FolderTree className="h-5 w-5 text-champagne-600" /> {cat ? 'Edit Category' : 'New Category'}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-ink-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <div><label className="label-luxe">Name</label><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-luxe" /></div>
          <div><label className="label-luxe">Slug</label><input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto" className="input-luxe" /></div>
          <div>
            <label className="label-luxe">Parent Category</label>
            <select value={form.parent_id} onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))} className="input-luxe">
              <option value="">— Top level —</option>
              {cats.filter((c) => c.id !== cat?.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="label-luxe">Icon Name (lucide)</label><input value={form.icon_name} onChange={(e) => setForm((f) => ({ ...f, icon_name: e.target.value }))} placeholder="e.g. Sparkles" className="input-luxe" /></div>
          <div><label className="label-luxe">Image URL</label><input value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} className="input-luxe" /></div>
          <div><label className="label-luxe">Description</label><textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-luxe resize-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label-luxe">Sort Order</label><input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} className="input-luxe" /></div>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-200 p-3 text-sm has-[:checked]:border-champagne-500 has-[:checked]:bg-champagne-50">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="peer sr-only" />
            <span className="flex h-5 w-5 items-center justify-center rounded-md border border-ink-300 peer-checked:border-champagne-500 peer-checked:bg-champagne-500 peer-checked:text-warmwhite">✓</span>
            Featured on homepage
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
