import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchBanners, fetchBrands, fetchCategories, fetchFeaturedProducts, fetchTestimonials } from '../lib/api';
import type { Banner, Brand, Category, Product, Testimonial } from '../types';
import { Hero } from '../components/home/Hero';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { ProductCarousel } from '../components/home/ProductCarousel';
import { EditorialBanners } from '../components/home/EditorialBanners';
import { Testimonials } from '../components/home/Testimonials';
import { BrandStrip } from '../components/home/BrandStrip';
import { InstagramGallery } from '../components/home/InstagramGallery';
import { BeautyTips } from '../components/home/BeautyTips';
import { ProductCardSkeleton } from '../components/ui/Skeleton';

export function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [b, c, br, bs, tr, na, t] = await Promise.all([
          fetchBanners(),
          fetchCategories(),
          fetchBrands(),
          fetchFeaturedProducts('bestseller', 10),
          fetchFeaturedProducts('trending', 10),
          fetchFeaturedProducts('new', 10),
          fetchTestimonials(),
        ]);
        if (!mounted) return;
        setBanners(b);
        setCategories(c);
        setBrands(br);
        setBestsellers(bs);
        setTrending(tr);
        setNewArrivals(na);
        setTestimonials(t);
      } catch (err) {
        console.error('Home load error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading && banners.length === 0) {
    return (
      <div className="container-luxe py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Hero banners={banners} />
      <CategoryGrid categories={categories} />
      <ProductCarousel
        title="Best Sellers"
        eyebrow="Iconic Favorites"
        products={bestsellers}
        viewAllLink="/shop?sort=bestselling"
      />
      <EditorialBanners banners={banners} />
      <ProductCarousel
        title="Trending Now"
        eyebrow="What Everyone's Loving"
        products={trending}
        viewAllLink="/shop?sort=rating"
        accent="rose"
      />
      <BrandStrip brands={brands} />
      <ProductCarousel
        title="New Arrivals"
        eyebrow="Just Landed"
        products={newArrivals}
        viewAllLink="/shop?sort=newest"
      />
      <Testimonials testimonials={testimonials} />
      <BeautyTips />
      <InstagramGallery />
    </div>
  );
}
