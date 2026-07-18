import { supabase } from './supabase';
import type { Banner, Brand, Category, Coupon, Product, Review, Testimonial } from '../types';

// ─── Brands ───
export async function fetchBrands(featuredOnly = false): Promise<Brand[]> {
  let q = supabase.from('brands').select('*').order('sort_order', { ascending: true });
  if (featuredOnly) q = q.eq('featured', true);
  const { data, error } = await q;
  if (error) throw error;
  return data as Brand[];
}

export async function fetchBrandBySlug(slug: string): Promise<Brand | null> {
  const { data, error } = await supabase.from('brands').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data as Brand | null;
}

// ─── Categories ───
export async function fetchCategories(featuredOnly = false): Promise<Category[]> {
  let q = supabase.from('categories').select('*').order('sort_order', { ascending: true });
  if (featuredOnly) q = q.eq('featured', true);
  const { data, error } = await q;
  if (error) throw error;
  return data as Category[];
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data as Category | null;
}

// ─── Products ───
const PRODUCT_RELATIONS = `
  *,
  brand:brands(*),
  category:categories(*),
  product_images(*),
  shades(*),
  sizes(*)
`;

export async function fetchProducts(opts: {
  category?: string | null;
  brand?: string | null;
  search?: string | null;
  sort?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  minRating?: number | null;
  inStockOnly?: boolean;
  tag?: string | null;
  limit?: number;
  page?: number;
} = {}): Promise<{ products: Product[]; total: number }> {
  const {
    category,
    brand,
    search,
    sort = 'featured',
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    tag,
    limit = 24,
    page = 1,
  } = opts;

  let q = supabase.from('products').select(PRODUCT_RELATIONS, { count: 'exact' }).eq('is_published', true);

  if (category) {
    const cat = await fetchCategoryBySlug(category);
    if (cat) q = q.eq('category_id', cat.id);
  }
  if (search) q = q.or(`name.ilike.%${search}%,short_description.ilike.%${search}%`);
  if (typeof minPrice === 'number') q = q.gte('price', minPrice);
  if (typeof maxPrice === 'number') q = q.lte('price', maxPrice);
  if (typeof minRating === 'number') q = q.gte('rating', minRating);
  if (inStockOnly) q = q.gt('stock', 0);
  if (tag) q = q.contains('tags', [tag]);

  // Brand filter via relationship — Supabase doesn't support filtering on FK slug directly,
  // so do a two-step: find brand id, then filter.
  if (brand) {
    const b = await fetchBrandBySlug(brand);
    if (b) q = q.eq('brand_id', b.id);
    else q = q.eq('brand_id', '00000000-0000-0000-0000-000000000000');
  }

  // Sort
  switch (sort) {
    case 'price-asc':
      q = q.order('price', { ascending: true });
      break;
    case 'price-desc':
      q = q.order('price', { ascending: false });
      break;
    case 'rating':
      q = q.order('rating', { ascending: false });
      break;
    case 'newest':
      q = q.order('created_at', { ascending: false });
      break;
    case 'bestselling':
      q = q.order('review_count', { ascending: false });
      break;
    default:
      q = q.order('is_featured', { ascending: false }).order('sort_order', { ascending: true });
  }

  const from = (page - 1) * limit;
  q = q.range(from, from + limit - 1);

  const { data, error, count } = await q;
  if (error) throw error;
  return { products: (data as Product[]) ?? [], total: count ?? 0 };
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_RELATIONS)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_RELATIONS)
    .in('id', ids)
    .eq('is_published', true);
  if (error) throw error;
  return (data as Product[]) ?? [];
}

export async function fetchFeaturedProducts(badge?: 'bestseller' | 'trending' | 'new' | 'featured', limit = 12): Promise<Product[]> {
  let q = supabase.from('products').select(PRODUCT_RELATIONS).eq('is_published', true);
  if (badge === 'bestseller') q = q.eq('is_bestseller', true);
  else if (badge === 'trending') q = q.eq('is_trending', true);
  else if (badge === 'new') q = q.eq('is_new', true).order('created_at', { ascending: false });
  else q = q.eq('is_featured', true);
  q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data as Product[]) ?? [];
}

export async function fetchRelatedProducts(productId: string, categoryId: string | null, limit = 6): Promise<Product[]> {
  let q = supabase
    .from('products')
    .select(PRODUCT_RELATIONS)
    .eq('is_published', true)
    .neq('id', productId)
    .limit(limit);
  if (categoryId) q = q.eq('category_id', categoryId);
  const { data, error } = await q;
  if (error) throw error;
  return (data as Product[]) ?? [];
}

export async function fetchSearchSuggestions(query: string, limit = 6): Promise<Product[]> {
  if (!query.trim()) return [];
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_RELATIONS)
    .eq('is_published', true)
    .or(`name.ilike.%${query}%,short_description.ilike.%${query}%`)
    .limit(limit);
  if (error) throw error;
  return (data as Product[]) ?? [];
}

// ─── Reviews ───
export async function fetchReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Review[]) ?? [];
}

export async function createReview(
  productId: string,
  authorName: string,
  rating: number,
  title: string,
  body: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('reviews').insert({
    product_id: productId,
    author_name: authorName,
    rating,
    title,
    body,
    is_verified: true,
  });
  return { error: error?.message ?? null };
}

// ─── Content ───
export async function fetchBanners(placement?: string): Promise<Banner[]> {
  let q = supabase.from('banners').select('*').eq('is_active', true).order('sort_order', { ascending: true });
  if (placement) q = q.eq('placement', placement);
  const { data, error } = await q;
  if (error) throw error;
  return data as Banner[];
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data as Testimonial[];
}

export async function fetchFaqs() {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchBlogPosts(limit = 6) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// ─── Coupons ───
export async function fetchCouponByCode(code: string): Promise<Coupon | null> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return data as Coupon | null;
}

// ─── Newsletter ───
export async function subscribeNewsletter(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('newsletter_subscribers').upsert(
    { email, is_active: true },
    { onConflict: 'email' },
  );
  return { error: error?.message ?? null };
}

// ─── Contact ───
export async function submitContact(name: string, email: string, subject: string, message: string) {
  const { error } = await supabase.from('contact_messages').insert({ name, email, subject, message });
  return { error: error?.message ?? null };
}
