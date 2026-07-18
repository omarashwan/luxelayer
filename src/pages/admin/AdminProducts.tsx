import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, X, Package, Copy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import type { Brand, Category, Product, Size } from '../../types';
import { classNames, discountPercent, effectivePrice, formatPrice, slugify } from '../../lib/utils';

interface SizeDraft {
  name: string;
  volume: string;
  weight: string;
  price_adjustment: string;
  stock: string;
}

interface Props {
  onEditProduct?: (p: Product) => void;
}

export function AdminProducts({}: Props) {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, b, c] = await Promise.all([
      supabase.from('products').select('*, brand:brands(name), category:categories(name), sizes(*)').order('created_at', { ascending: false }),
      supabase.from('brands').select('*').order('name'),
      supabase.from('categories').select('*').order('name'),
    ]);
    setProducts((p.data as Product[]) ?? []);
    setBrands((b.data as Brand[]) ?? []);
    setCategories((c.data as Category[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase()),
  );

  const onDelete = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) toast(error.message, 'error');
    else { toast('Product deleted'); load(); }
  };

  const onDuplicate = async (p: Product) => {
    const { id, created_at, updated_at, slug, sku, ...rest } = p;
    const newSlug = `${slug}-copy-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabase.from('products').insert({
      ...rest,
      name: `${p.name} (Copy)`,
      slug: newSlug,
      sku: sku ? `${sku}-COPY` : null,
      stock: 0,
    });
    if (error) toast(error.message, 'error');
    else { toast('Product duplicated'); load(); }
  };

  const onSave = async (data: Partial<Product>, sizes: SizeDraft[]) => {
    let productId: string;
    if (editing) {
      const { error } = await supabase.from('products').update({
        ...data,
        slug: data.slug ? slugify(data.slug) : undefined,
        updated_at: new Date().toISOString(),
      }).eq('id', editing.id);
      if (error) { toast(error.message, 'error'); return; }
      productId = editing.id;
      toast('Product updated');
    } else {
      const { data: created, error } = await supabase.from('products').insert({
        ...data,
        slug: slugify(data.slug ?? data.name ?? 'product'),
      }).select('id').single();
      if (error) { toast(error.message, 'error'); return; }
      productId = created.id;
      toast('Product created');
    }

    // Sync sizes: delete existing, then insert the new set.
    const { error: delErr } = await supabase.from('sizes').delete().eq('product_id', productId);
    if (delErr) { toast(`Sizes sync failed: ${delErr.message}`, 'error'); }
    const valid = sizes.filter((s) => s.name.trim() !== '');
    if (valid.length > 0) {
      const rows = valid.map((s, i) => ({
        product_id: productId,
        name: s.name.trim(),
        volume: s.volume.trim() || null,
        weight: s.weight.trim() || null,
        price_adjustment: Number(s.price_adjustment) || 0,
        stock: Number(s.stock) || 0,
        sort_order: i,
      }));
      const { error: insErr } = await supabase.from('sizes').insert(rows);
      if (insErr) { toast(`Sizes save failed: ${insErr.message}`, 'error'); }
    }

    setShowForm(false);
    setEditing(null);
    load();
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products or SKU…"
            className="w-72 rounded-xl border border-ink-200 bg-warmwhite py-2.5 pl-10 pr-4 text-sm focus:border-champagne-400 focus:outline-none"
          />
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="btn-primary text-sm"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-warmwhite ring-1 ring-ink-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-ink-400">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-ink-400">No products found</td></tr>
              ) : (
                filtered.map((p) => {
                  const price = effectivePrice(p.price, p.sale_price);
                  const discount = discountPercent(p.price, p.sale_price);
                  return (
                    <tr key={p.id} className="transition hover:bg-ink-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.featured_image_url ?? ''} alt="" className="h-12 w-10 rounded-lg object-cover" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink-900">{p.name}</p>
                            <p className="text-xs text-ink-500">SKU: {p.sku ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-700">{p.brand?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-ink-900">{formatPrice(price)}</span>
                        {discount > 0 && <span className="ml-1 text-xs text-emerald-600">-{discount}%</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={classNames('font-medium', p.stock <= p.low_stock_threshold ? 'text-amber-600' : 'text-ink-900')}>{p.stock}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={classNames('rounded-full px-2 py-0.5 text-xs font-semibold', p.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-ink-100 text-ink-500')}>
                          {p.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => onDuplicate(p)} className="rounded-lg p-2 text-ink-500 hover:bg-cream hover:text-ink-900" title="Duplicate">
                            <Copy className="h-4 w-4" />
                          </button>
                          <button onClick={() => { setEditing(p); setShowForm(true); }} className="rounded-lg p-2 text-ink-500 hover:bg-cream hover:text-ink-900" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => onDelete(p)} className="rounded-lg p-2 text-ink-500 hover:bg-rose-50 hover:text-rose-600" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <ProductForm
            product={editing}
            brands={brands}
            categories={categories}
            onClose={() => { setShowForm(false); setEditing(null); }}
            onSave={onSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductForm({ product, brands, categories, onClose, onSave }: {
  product: Product | null;
  brands: Brand[];
  categories: Category[];
  onClose: () => void;
  onSave: (data: Partial<Product>, sizes: SizeDraft[]) => void;
}) {
  const [sizes, setSizes] = useState<SizeDraft[]>(product?.sizes?.length
    ? product.sizes.map((s) => ({ name: s.name, volume: s.volume ?? '', weight: s.weight ?? '', price_adjustment: String(s.price_adjustment), stock: String(s.stock) }))
    : []);

  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    brand_id: product?.brand_id ?? '',
    category_id: product?.category_id ?? '',
    short_description: product?.short_description ?? '',
    description: product?.description ?? '',
    price: product?.price ?? 0,
    sale_price: product?.sale_price ?? '',
    stock: product?.stock ?? 0,
    low_stock_threshold: product?.low_stock_threshold ?? 5,
    sku: product?.sku ?? '',
    barcode: product?.barcode ?? '',
    ingredients: product?.ingredients ?? '',
    how_to_use: product?.how_to_use ?? '',
    benefits: product?.benefits ?? '',
    warnings: product?.warnings ?? '',
    featured_image_url: product?.featured_image_url ?? '',
    is_published: product?.is_published ?? true,
    is_featured: product?.is_featured ?? false,
    is_bestseller: product?.is_bestseller ?? false,
    is_trending: product?.is_trending ?? false,
    is_new: product?.is_new ?? false,
    seo_title: product?.seo_title ?? '',
    seo_description: product?.seo_description ?? '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      brand_id: form.brand_id || null,
      category_id: form.category_id || null,
      sale_price: form.sale_price === '' ? null : Number(form.sale_price),
      price: Number(form.price),
      stock: Number(form.stock),
      low_stock_threshold: Number(form.low_stock_threshold),
    }, sizes);
  };

  const addSize = () => setSizes((prev) => [...prev, { name: '', volume: '', weight: '', price_adjustment: '0', stock: '0' }]);
  const removeSize = (i: number) => setSizes((prev) => prev.filter((_, idx) => idx !== i));
  const updateSize = (i: number, field: keyof SizeDraft, value: string) => setSizes((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.form
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        onSubmit={submit}
        className="my-8 w-full max-w-3xl rounded-3xl bg-warmwhite p-7 shadow-luxe-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-medium text-ink-900">
            <Package className="h-5 w-5 text-champagne-600" />
            {product ? 'Edit Product' : 'New Product'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-ink-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Name"><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-luxe" /></FormField>
            <FormField label="Slug"><input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" className="input-luxe" /></FormField>
            <FormField label="Brand">
              <select value={form.brand_id} onChange={(e) => setForm((f) => ({ ...f, brand_id: e.target.value }))} className="input-luxe">
                <option value="">— None —</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </FormField>
            <FormField label="Category">
              <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))} className="input-luxe">
                <option value="">— None —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="Short Description"><input value={form.short_description} onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))} className="input-luxe" /></FormField>
          <FormField label="Description"><textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-luxe resize-none" /></FormField>
          <FormField label="Featured Image URL"><input value={form.featured_image_url} onChange={(e) => setForm((f) => ({ ...f, featured_image_url: e.target.value }))} placeholder="https://…" className="input-luxe" /></FormField>

          <div className="grid gap-4 sm:grid-cols-4">
            <FormField label="Price ($)"><input type="number" step="0.01" required value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value as unknown as number }))} className="input-luxe" /></FormField>
            <FormField label="Sale Price"><input type="number" step="0.01" value={form.sale_price} onChange={(e) => setForm((f) => ({ ...f, sale_price: e.target.value as unknown as number }))} className="input-luxe" /></FormField>
            <FormField label="Stock"><input type="number" required value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value as unknown as number }))} className="input-luxe" /></FormField>
            <FormField label="Low Stock Alert"><input type="number" value={form.low_stock_threshold} onChange={(e) => setForm((f) => ({ ...f, low_stock_threshold: e.target.value as unknown as number }))} className="input-luxe" /></FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="SKU"><input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className="input-luxe" /></FormField>
            <FormField label="Barcode"><input value={form.barcode} onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))} className="input-luxe" /></FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Ingredients"><textarea rows={2} value={form.ingredients} onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))} className="input-luxe resize-none" /></FormField>
            <FormField label="How To Use"><textarea rows={2} value={form.how_to_use} onChange={(e) => setForm((f) => ({ ...f, how_to_use: e.target.value }))} className="input-luxe resize-none" /></FormField>
            <FormField label="Benefits"><textarea rows={2} value={form.benefits} onChange={(e) => setForm((f) => ({ ...f, benefits: e.target.value }))} className="input-luxe resize-none" /></FormField>
            <FormField label="Warnings"><textarea rows={2} value={form.warnings} onChange={(e) => setForm((f) => ({ ...f, warnings: e.target.value }))} className="input-luxe resize-none" /></FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="SEO Title"><input value={form.seo_title} onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))} className="input-luxe" /></FormField>
            <FormField label="SEO Description"><input value={form.seo_description} onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))} className="input-luxe" /></FormField>
          </div>

          {/* Sizes */}
          <div className="rounded-2xl border border-ink-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink-900">Sizes & Variants</h3>
                <p className="text-xs text-ink-500">Optional. Add size or format variants (e.g. 30ml, Travel Size) with per-variant stock and price adjustments.</p>
              </div>
              <button type="button" onClick={addSize} className="flex items-center gap-1 rounded-lg bg-champagne-50 px-3 py-1.5 text-sm font-medium text-champagne-700 hover:bg-champagne-100">
                <Plus className="h-4 w-4" /> Add Size
              </button>
            </div>
            {sizes.length === 0 ? (
              <p className="py-4 text-center text-sm text-ink-400">No sizes added. The product base price and stock will be used.</p>
            ) : (
              <div className="space-y-2">
                {sizes.map((s, i) => (
                  <div key={i} className="grid grid-cols-12 items-center gap-2">
                    <input value={s.name} onChange={(e) => updateSize(i, 'name', e.target.value)} placeholder="Name (e.g. 30ml)" className="input-luxe col-span-3 !py-2 text-sm" />
                    <input value={s.volume} onChange={(e) => updateSize(i, 'volume', e.target.value)} placeholder="Volume" className="input-luxe col-span-3 !py-2 text-sm" />
                    <input value={s.weight} onChange={(e) => updateSize(i, 'weight', e.target.value)} placeholder="Weight" className="input-luxe col-span-2 !py-2 text-sm" />
                    <input type="number" step="0.01" value={s.price_adjustment} onChange={(e) => updateSize(i, 'price_adjustment', e.target.value)} placeholder="Adj $" className="input-luxe col-span-2 !py-2 text-sm" />
                    <div className="col-span-2 flex items-center gap-1">
                      <input type="number" value={s.stock} onChange={(e) => updateSize(i, 'stock', e.target.value)} placeholder="Stock" className="input-luxe !py-2 text-sm" />
                      <button type="button" onClick={() => removeSize(i)} className="shrink-0 rounded-lg p-2 text-ink-400 hover:bg-rose-50 hover:text-rose-600"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flags */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { key: 'is_published', label: 'Published' },
              { key: 'is_featured', label: 'Featured' },
              { key: 'is_bestseller', label: 'Bestseller' },
              { key: 'is_trending', label: 'Trending' },
              { key: 'is_new', label: 'New' },
            ].map((flag) => (
              <label key={flag.key} className="flex cursor-pointer items-center gap-2 rounded-xl border border-ink-200 p-3 text-sm has-[:checked]:border-champagne-500 has-[:checked]:bg-champagne-50">
                <input type="checkbox" checked={form[flag.key as keyof typeof form] as boolean} onChange={(e) => setForm((f) => ({ ...f, [flag.key]: e.target.checked }))} className="peer sr-only" />
                <span className="flex h-5 w-5 items-center justify-center rounded-md border border-ink-300 peer-checked:border-champagne-500 peer-checked:bg-champagne-500 peer-checked:text-warmwhite">✓</span>
                {flag.label}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">{product ? 'Save Changes' : 'Create Product'}</button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-luxe">{label}</label>
      {children}
    </div>
  );
}
