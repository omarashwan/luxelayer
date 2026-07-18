import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { classNames } from '../../lib/utils';

type ContentType = 'banners' | 'testimonials' | 'faqs' | 'newsletter';
const TABS: { id: ContentType; label: string }[] = [
  { id: 'banners', label: 'Banners' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'newsletter', label: 'Newsletter' },
];

export function AdminContent() {
  const [tab, setTab] = useState<ContentType>('banners');

  return (
    <div className="space-y-5">
      <div className="flex gap-2 rounded-full bg-warmwhite p-1 ring-1 ring-ink-200">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={classNames('flex-1 rounded-full py-2 text-sm font-medium transition', tab === t.id ? 'bg-ink-900 text-warmwhite' : 'text-ink-600')}>{t.label}</button>
        ))}
      </div>
      {tab === 'banners' && <BannersManager />}
      {tab === 'testimonials' && <TestimonialsManager />}
      {tab === 'faqs' && <FaqsManager />}
      {tab === 'newsletter' && <NewsletterManager />}
    </div>
  );
}

function BannersManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('banners').select('*').order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const onDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) toast(error.message, 'error'); else { toast('Banner deleted'); load(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Add Banner</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {loading ? <p className="col-span-full text-center text-ink-400">Loading…</p> :
          items.length === 0 ? <p className="col-span-full text-center text-ink-400">No banners</p> :
          items.map((b) => (
            <div key={b.id as string} className="overflow-hidden rounded-2xl bg-warmwhite ring-1 ring-ink-200">
              <div className="relative aspect-[16/9] bg-cream">
                {b.image_url as string && <img src={b.image_url as string} alt="" className="h-full w-full object-cover" />}
                <span className={classNames('absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-semibold', b.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-ink-100 text-ink-500')}>{b.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="p-4">
                <h3 className="font-display text-base font-medium text-ink-900">{b.title as string}</h3>
                <p className="text-xs text-ink-500 capitalize">{b.placement as string}</p>
                <button onClick={() => onDelete(b.id as string)} className="mt-3 flex items-center gap-1 text-xs text-rose-600 hover:underline"><Trash2 className="h-3 w-3" /> Delete</button>
              </div>
            </div>
          ))}
      </div>
      <AnimatePresence>
        {showForm && <SimpleForm title="New Banner" fields={[{ name: 'title', label: 'Title', required: true }, { name: 'subtitle', label: 'Subtitle' }, { name: 'image_url', label: 'Image URL' }, { name: 'cta_label', label: 'CTA Label' }, { name: 'cta_link', label: 'CTA Link' }, { name: 'placement', label: 'Placement', default: 'hero' }, { name: 'sort_order', label: 'Sort Order', type: 'number', default: '0' }]} table="banners" onClose={() => setShowForm(false)} onSaved={load} />}
      </AnimatePresence>
    </div>
  );
}

function TestimonialsManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('testimonials').select('*').order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const onDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) toast(error.message, 'error'); else { toast('Testimonial deleted'); load(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Add Testimonial</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? <p className="col-span-full text-center text-ink-400">Loading…</p> :
          items.length === 0 ? <p className="col-span-full text-center text-ink-400">No testimonials</p> :
          items.map((t) => (
            <div key={t.id as string} className="rounded-2xl bg-warmwhite p-5 ring-1 ring-ink-200">
              <p className="font-serif text-sm italic text-ink-700">"{t.quote as string}"</p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-900">{t.author_name as string}</p>
                  <p className="text-xs text-ink-500">{t.author_title as string ?? ''}</p>
                </div>
                <button onClick={() => onDelete(t.id as string)} className="text-rose-600 hover:underline"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
      </div>
      <AnimatePresence>
        {showForm && <SimpleForm title="New Testimonial" fields={[{ name: 'author_name', label: 'Author Name', required: true }, { name: 'author_title', label: 'Author Title' }, { name: 'avatar_url', label: 'Avatar URL' }, { name: 'quote', label: 'Quote', required: true }, { name: 'rating', label: 'Rating (1-5)', type: 'number', default: '5' }, { name: 'sort_order', label: 'Sort Order', type: 'number', default: '0' }]} table="testimonials" onClose={() => setShowForm(false)} onSaved={load} />}
      </AnimatePresence>
    </div>
  );
}

function FaqsManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('faqs').select('*').order('sort_order');
    setItems(data ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const onDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) toast(error.message, 'error'); else { toast('FAQ deleted'); load(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Add FAQ</button>
      </div>
      <div className="space-y-3">
        {loading ? <p className="text-center text-ink-400">Loading…</p> :
          items.length === 0 ? <p className="text-center text-ink-400">No FAQs</p> :
          items.map((f) => (
            <div key={f.id as string} className="rounded-2xl bg-warmwhite p-4 ring-1 ring-ink-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-ink-900">{f.question as string}</p>
                  <p className="mt-1 text-sm text-ink-600">{f.answer as string}</p>
                  {f.category as string && <span className="mt-2 inline-block rounded-full bg-cream px-2 py-0.5 text-xs text-ink-600">{f.category as string}</span>}
                </div>
                <button onClick={() => onDelete(f.id as string)} className="text-rose-600 hover:underline"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
      </div>
      <AnimatePresence>
        {showForm && <SimpleForm title="New FAQ" fields={[{ name: 'question', label: 'Question', required: true }, { name: 'answer', label: 'Answer', required: true, textarea: true }, { name: 'category', label: 'Category' }, { name: 'sort_order', label: 'Sort Order', type: 'number', default: '0' }]} table="faqs" onClose={() => setShowForm(false)} onSaved={load} />}
      </AnimatePresence>
    </div>
  );
}

function NewsletterManager() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="overflow-hidden rounded-2xl bg-warmwhite ring-1 ring-ink-200">
      <div className="border-b border-ink-200 p-4">
        <h3 className="font-display text-lg font-medium text-ink-900">Newsletter Subscribers ({items.length})</h3>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="border-b border-ink-200 bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500"><th className="px-4 py-3">Email</th><th className="px-4 py-3">Subscribed</th><th className="px-4 py-3">Status</th></tr></thead>
        <tbody className="divide-y divide-ink-100">
          {loading ? <tr><td colSpan={3} className="px-4 py-12 text-center text-ink-400">Loading…</td></tr> :
            items.length === 0 ? <tr><td colSpan={3} className="px-4 py-12 text-center text-ink-400">No subscribers</td></tr> :
            items.map((s) => (
              <tr key={s.id as string}>
                <td className="px-4 py-3 font-medium text-ink-900">{s.email as string}</td>
                <td className="px-4 py-3 text-ink-500">{new Date(s.created_at as string).toLocaleDateString()}</td>
                <td className="px-4 py-3"><span className={classNames('rounded-full px-2 py-0.5 text-xs font-semibold', s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-ink-100 text-ink-500')}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

interface FieldDef { name: string; label: string; required?: boolean; type?: string; default?: string; textarea?: boolean }

function SimpleForm({ title, fields, table, onClose, onSaved }: { title: string; fields: FieldDef[]; table: string; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    fields.forEach((f) => { init[f.name] = f.default ?? ''; });
    return init;
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = { ...form };
    fields.forEach((f) => {
      if (f.type === 'number') payload[f.name] = Number(form[f.name]) || 0;
    });
    const { error } = await supabase.from(table).insert(payload);
    if (error) { toast(error.message, 'error'); return; }
    toast('Created');
    onClose();
    onSaved();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.form initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onSubmit={submit} className="w-full max-w-lg rounded-3xl bg-warmwhite p-7 shadow-luxe-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-medium text-ink-900">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-ink-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="label-luxe">{f.label}</label>
              {f.textarea ? (
                <textarea rows={3} value={form[f.name]} onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))} className="input-luxe resize-none" />
              ) : (
                <input type={f.type ?? 'text'} required={f.required} value={form[f.name]} onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))} className="input-luxe" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1"><Save className="h-4 w-4" /> Create</button>
        </div>
      </motion.form>
    </motion.div>
  );
}
