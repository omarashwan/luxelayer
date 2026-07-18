export type UUID = string;

export interface Brand {
  id: UUID;
  name: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  country: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: UUID;
  name: string;
  slug: string;
  parent_id: UUID | null;
  icon_name: string | null;
  image_url: string | null;
  description: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface ProductImage {
  id: UUID;
  product_id: UUID;
  url: string;
  alt: string | null;
  sort_order: number;
  created_at: string;
}

export interface Shade {
  id: UUID;
  product_id: UUID;
  name: string;
  hex_color: string | null;
  image_url: string | null;
  stock: number;
  sort_order: number;
  created_at: string;
}

export interface Size {
  id: UUID;
  product_id: UUID;
  name: string;
  volume: string | null;
  weight: string | null;
  price_adjustment: number;
  stock: number;
  sort_order: number;
  created_at: string;
}

export interface Review {
  id: UUID;
  product_id: UUID;
  user_id: UUID | null;
  author_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
}

export interface Product {
  id: UUID;
  name: string;
  slug: string;
  brand_id: UUID | null;
  category_id: UUID | null;
  short_description: string | null;
  description: string | null;
  price: number;
  sale_price: number | null;
  currency: string;
  sku: string | null;
  barcode: string | null;
  stock: number;
  low_stock_threshold: number;
  weight_grams: number | null;
  dimensions: string | null;
  ingredients: string | null;
  how_to_use: string | null;
  benefits: string | null;
  warnings: string | null;
  shipping_info: string | null;
  returns_info: string | null;
  tags: string[];
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_trending: boolean;
  is_new: boolean;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  featured_image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  brand?: Brand | null;
  category?: Category | null;
  product_images?: ProductImage[];
  shades?: Shade[];
  sizes?: Size[];
}

export interface Coupon {
  id: UUID;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  min_purchase: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Address {
  id: UUID;
  user_id: UUID;
  label: string | null;
  first_name: string;
  last_name: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
}

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  product_id: UUID | null;
  name: string;
  slug: string | null;
  image_url: string | null;
  shade: string | null;
  size: string | null;
  unit_price: number;
  quantity: number;
  total: number;
  created_at: string;
}

export interface Order {
  id: UUID;
  order_number: string;
  user_id: UUID | null;
  email: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'returned';
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  coupon_code: string | null;
  shipping_first_name: string | null;
  shipping_last_name: string | null;
  shipping_address1: string | null;
  shipping_address2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  shipping_phone: string | null;
  shipping_method: string | null;
  tracking_number: string | null;
  payment_method: string | null;
  payment_status: 'unpaid' | 'paid' | 'refunded' | 'failed';
  gift_wrap: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface Banner {
  id: UUID;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_link: string | null;
  placement: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Testimonial {
  id: UUID;
  author_name: string;
  author_title: string | null;
  avatar_url: string | null;
  quote: string;
  rating: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface BlogPost {
  id: UUID;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  cover_url: string | null;
  author: string | null;
  category: string | null;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

export interface Faq {
  id: UUID;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: UUID;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: UUID;
  user_id: UUID;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface WishlistRow {
  id: UUID;
  user_id: UUID;
  product_id: UUID;
  created_at: string;
}

// ─── Cart (client-only) ───
export interface CartItem {
  productId: UUID;
  slug: string;
  name: string;
  image: string | null;
  price: number; // unit price including adjustments
  basePrice: number;
  quantity: number;
  shadeId: UUID | null;
  shadeName: string | null;
  sizeId: UUID | null;
  sizeName: string | null;
  stock: number;
  brandName?: string | null;
}
