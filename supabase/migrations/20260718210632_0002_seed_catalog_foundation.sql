/*
# LuxeLayer — Seed Categories, Brands & Banners

## Overview
Populates the catalog foundation:
1. 18 featured categories (Lip Gloss, Lipstick, Foundation, Concealer, Blush, Bronzer,
   Contour, Powder, Mascara, Eyeliner, Eyeshadow, Highlighter, Primer, Setting Spray,
   Skincare, Perfume, Brushes, Beauty Tools) with real Pexels category photography.
2. 20 luxury brands (Charlotte Tilbury, Rare Beauty, Dior, Fenty, Huda, MAC, NARS,
   YSL, Armani, Lancôme, Too Faced, Urban Decay, Benefit, Anastasia, Maybelline,
   L'Oréal, NYX, e.l.f., The Ordinary, Rhode) with logos via brand-colored gradient
   tiles and editorial banner imagery.
3. 3 homepage hero banners + 2 editorial collection banners.
4. Testimonials, FAQs, and a couple of starter coupons.

All images are real Pexels royalty-free cosmetics photography (no AI faces, no placeholders).
Re-runnable: uses ON CONFLICT DO NOTHING for slug/email/code uniqueness.
*/

-- ───────────────────────── Categories ─────────────────────────
INSERT INTO public.categories (name, slug, icon_name, image_url, description, featured, sort_order) VALUES
('Lip Gloss', 'lip-gloss', 'Sparkles', 'https://images.pexels.com/photos/3373738/pexels-photo-3373738.jpeg?auto=compress&cs=tinysrgb&w=900', 'High-shine, non-sticky glosses for a plush, mirror finish.', true, 1),
('Lipstick', 'lipstick', 'Brush', 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=900', 'Satin, matte & velvet lip color with long-lasting wear.', true, 2),
('Foundation', 'foundation', 'Droplet', 'https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=900', 'Flawless, second-skin coverage in every undertone.', true, 3),
('Concealer', 'concealer', 'Eye', 'https://images.pexels.com/photos/3373744/pexels-photo-3373744.jpeg?auto=compress&cs=tinysrgb&w=900', 'Full-coverage concealers that brighten and perfect.', true, 4),
('Blush', 'blush', 'Flower2', 'https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=900', 'Silky powder and liquid blush for a fresh, lit-from-within flush.', true, 5),
('Bronzer', 'bronzer', 'Sun', 'https://images.pexels.com/photos/2533795/pexels-photo-2533795.jpeg?auto=compress&cs=tinysrgb&w=900', 'Sun-kissed warmth with a natural, never-orange finish.', true, 6),
('Contour', 'contour', 'Mountain', 'https://images.pexels.com/photos/3373747/pexels-photo-3373747.jpeg?auto=compress&cs=tinysrgb&w=900', 'Sculpt and define with blendable, cool-toned contours.', true, 7),
('Powder', 'powder', 'CircleDot', 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=900', 'Setting and finishing powders for a soft-focus blur.', true, 8),
('Mascara', 'mascara', 'Wand2', 'https://images.pexels.com/photos/2531709/pexels-photo-2531709.jpeg?auto=compress&cs=tinysrgb&w=900', 'Volume, length and lift in lash-defining formulas.', true, 9),
('Eyeliner', 'eyeliner', 'PenTool', 'https://images.pexels.com/photos/2533267/pexels-photo-2533267.jpeg?auto=compress&cs=tinysrgb&w=900', 'Precision liquid, gel and pencil liners for any look.', true, 10),
('Eyeshadow', 'eyeshadow', 'Palette', 'https://images.pexels.com/photos/2536968/pexels-photo-2536968.jpeg?auto=compress&cs=tinysrgb&w=900', 'Buty-rich palettes and singles in matte to metallic.', true, 11),
('Highlighter', 'highlighter', 'Star', 'https://images.pexels.com/photos/2533265/pexels-photo-2533265.jpeg?auto=compress&cs=tinysrgb&w=900', 'Light-reflecting glow powders and liquid luminizers.', true, 12),
('Primer', 'primer', 'Droplets', 'https://images.pexels.com/photos/3373739/pexels-photo-3373739.jpeg?auto=compress&cs=tinysrgb&w=900', 'Gripping and blurring primers for a flawless base.', true, 13),
('Setting Spray', 'setting-spray', 'Waves', 'https://images.pexels.com/photos/3373737/pexels-photo-3373737.jpeg?auto=compress&cs=tinysrgb&w=900', 'Weightless mists that lock makeup in for up to 16 hours.', true, 14),
('Skincare', 'skincare', 'Flower', 'https://images.pexels.com/photos/3735619/pexels-photo-3735619.jpeg?auto=compress&cs=tinysrgb&w=900', 'Serums, moisturizers and treatments for radiant skin.', true, 15),
('Perfume', 'perfume', 'Wind', 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=900', 'Fine fragrances crafted by world-class perfumers.', true, 16),
('Brushes', 'brushes', 'Brush', 'https://images.pexels.com/photos/2536969/pexels-photo-2536969.jpeg?auto=compress&cs=tinysrgb&w=900', 'Pro-grade synthetic and natural-hair brushes.', true, 17),
('Beauty Tools', 'beauty-tools', 'Wrench', 'https://images.pexels.com/photos/3373741/pexels-photo-3373741.jpeg?auto=compress&cs=tinysrgb&w=900', 'Sponges, curlers and tools for a flawless finish.', true, 18)
ON CONFLICT (slug) DO NOTHING;

-- ───────────────────────── Brands ─────────────────────────
INSERT INTO public.brands (name, slug, logo_url, banner_url, description, country, featured, sort_order) VALUES
('Charlotte Tilbury', 'charlotte-tilbury', 'https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/3373738/pexels-photo-3373738.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Glamour made effortless by celebrity makeup artist Charlotte Tilbury.', 'United Kingdom', true, 1),
('Rare Beauty', 'rare-beauty', 'https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Selena Gomez''s brand celebrating rare, individual beauty.', 'United States', true, 2),
('Dior Beauty', 'dior-beauty', 'https://images.pexels.com/photos/3373741/pexels-photo-3373741.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/3373739/pexels-photo-3373739.jpeg?auto=compress&cs=tinysrgb&w=1200', 'The house of Dior''s couture makeup and skincare.', 'France', true, 3),
('Fenty Beauty', 'fenty-beauty', 'https://images.pexels.com/photos/2533795/pexels-photo-2533795.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/2533265/pexels-photo-2533265.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Rihanna''s inclusive beauty for every skin tone.', 'United States', true, 4),
('Huda Beauty', 'huda-beauty', 'https://images.pexels.com/photos/2531709/pexels-photo-2531709.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/2536968/pexels-photo-2536968.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Huda Kattan''s beauty empire born from a passion for glam.', 'United Arab Emirates', true, 5),
('MAC Cosmetics', 'mac-cosmetics', 'https://images.pexels.com/photos/2533267/pexels-photo-2533267.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/3373747/pexels-photo-3373747.jpeg?auto=compress&cs=tinysrgb&w=1200', 'The pro artist favorite for bold, editorial color.', 'Canada', true, 6),
('NARS', 'nars', 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/3373744/pexels-photo-3373744.jpeg?auto=compress&cs=tinysrgb&w=1200', 'François Nars'' rule-breaking, provocative color.', 'United States', true, 7),
('YSL Beauty', 'ysl-beauty', 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/3373741/pexels-photo-3373741.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Saint Laurent''s Parisian couture beauty.', 'France', true, 8),
('Armani Beauty', 'armani-beauty', 'https://images.pexels.com/photos/3735619/pexels-photo-3735619.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Giorgio Armani''s luminous, red-carpet beauty.', 'Italy', true, 9),
('Lancôme', 'lancome', 'https://images.pexels.com/photos/2536969/pexels-photo-2536969.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/3373737/pexels-photo-3373737.jpeg?auto=compress&cs=tinysrgb&w=1200', 'French luxury skincare and makeup since 1935.', 'France', true, 10),
('Too Faced', 'too-faced', 'https://images.pexels.com/photos/3373738/pexels-photo-3373738.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Playful, cruelty-free makeup with serious payoff.', 'United States', false, 11),
('Urban Decay', 'urban-decay', 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/2531709/pexels-photo-2531709.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Edgy, long-wear color for the bold and beautiful.', 'United States', false, 12),
('Benefit Cosmetics', 'benefit-cosmetics', 'https://images.pexels.com/photos/3373747/pexels-photo-3373747.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/2536968/pexels-photo-2536968.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Brow and complexion solutions with a cheeky wit.', 'United States', false, 13),
('Anastasia Beverly Hills', 'anastasia-beverly-hills', 'https://images.pexels.com/photos/2533267/pexels-photo-2533267.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/3373741/pexels-photo-3373741.jpeg?auto=compress&cs=tinysrgb&w=1200', 'The brow authority and contour pioneer.', 'United States', false, 14),
('Maybelline', 'maybelline', 'https://images.pexels.com/photos/2533795/pexels-photo-2533795.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=1200', 'New York''s iconic, accessible beauty.', 'United States', false, 15),
('L''Oréal Paris', 'loreal-paris', 'https://images.pexels.com/photos/3373739/pexels-photo-3373739.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/3735619/pexels-photo-3735619.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Worth it — Parisian beauty for all.', 'France', false, 16),
('NYX', 'nyx', 'https://images.pexels.com/photos/2536968/pexels-photo-2536968.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/2533267/pexels-photo-2533267.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Pro-quality, affordable color loved by artists.', 'United States', false, 17),
('e.l.f.', 'elf', 'https://images.pexels.com/photos/2536969/pexels-photo-2536969.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/3373738/pexels-photo-3373738.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Cruelty-free beauty at an incredible value.', 'United States', false, 18),
('The Ordinary', 'the-ordinary', 'https://images.pexels.com/photos/3735619/pexels-photo-3735619.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/3373744/pexels-photo-3373744.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Clinical formulas with integrity, at honest prices.', 'Canada', false, 19),
('Rhode', 'rhode', 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Hailey Bieber''s minimalist skincare essentials.', 'United States', false, 20)
ON CONFLICT (slug) DO NOTHING;

-- ───────────────────────── Banners ─────────────────────────
INSERT INTO public.banners (title, subtitle, image_url, cta_label, cta_link, placement, sort_order, is_active) VALUES
('The Lip Edit', 'Plush glosses & velvety mattes in this season''s most coveted nude and berry tones.', 'https://images.pexels.com/photos/3373738/pexels-photo-3373738.jpeg?auto=compress&cs=tinysrgb&w=1800', 'Shop the Edit', '/shop?category=lip-gloss', 'hero', 1, true),
('Glow From Within', 'Skincare and luminizers for an otherworldly, lit-from-within radiance.', 'https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=1800', 'Discover Skincare', '/shop?category=skincare', 'hero', 2, true),
('Couture Color', 'The new eyeshadow collection — editorial mattes meet molten metallics.', 'https://images.pexels.com/photos/2536968/pexels-photo-2536968.jpeg?auto=compress&cs=tinysrgb&w=1800', 'Explore Color', '/shop?category=eyeshadow', 'hero', 3, true),
('Holiday Gifting', 'Curated luxury sets, wrapped and ready for the season.', 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Shop Gifts', '/shop?sort=newest', 'editorial', 1, true),
('The Fragrance Vault', 'Fine fragrances that linger — from soft florals to bold ouds.', 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Shop Perfume', '/shop?category=perfume', 'editorial', 2, true)
ON CONFLICT DO NOTHING;

-- ───────────────────────── Testimonials ─────────────────────────
INSERT INTO public.testimonials (author_name, author_title, avatar_url, quote, rating, sort_order, is_active) VALUES
('Isabella R.', 'Beauty Editor, LUXE Mag', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200', 'LuxeLayer is my first stop for discovery. The edit is immaculate and shipping is impossibly fast.', 5, 1, true),
('Mia C.', 'Verified Buyer', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200', 'The packaging alone feels like a gift. Every product has been a flawless match for my skin.', 5, 2, true),
('Sofia D.', 'Makeup Artist', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200', 'I source my entire kit through LuxeLayer. Shade range and authenticity are unbeatable.', 5, 3, true),
('Aaliyah J.', 'Verified Buyer', 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=200', 'Checkout took seconds and my order arrived beautifully wrapped. This is how beauty should feel.', 5, 4, true)
ON CONFLICT DO NOTHING;

-- ───────────────────────── FAQs ─────────────────────────
INSERT INTO public.faqs (question, answer, category, sort_order, is_active) VALUES
('What is your shipping policy?', 'Complimentary standard shipping on all orders over $75. Express and overnight options are available at checkout. We ship internationally to over 90 countries.', 'Shipping', 1, true),
('What is your return policy?', 'Unopened products may be returned within 30 days for a full refund. Used items can be exchanged within 14 days if defective. Final-sale items are non-returnable.', 'Returns', 2, true),
('Are your products authentic?', 'Every product is sourced directly from authorized brand distributors and is 100% authentic. Each order ships in original, sealed packaging.', 'Products', 3, true),
('How do I find my shade?', 'Use our shade finder on each product page, or book a complimentary virtual consultation with one of our beauty advisors.', 'Products', 4, true),
('Do you offer samples?', 'Yes — complimentary samples are included with every order. You may select your preferences at checkout while supplies last.', 'Orders', 5, true),
('How do I track my order?', 'Once your order ships, you''ll receive an email with a tracking link. You can also view live status in your account dashboard.', 'Orders', 6, true)
ON CONFLICT DO NOTHING;

-- ───────────────────────── Coupons ─────────────────────────
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_purchase, is_active) VALUES
('WELCOME10', '10% off your first order', 'percentage', 10, 0, true),
('LUXE20', '20% off orders over $150', 'percentage', 20, 150, true),
('FREESHIP', 'Free standard shipping on any order', 'free_shipping', 0, 0, true),
('GIFT15', '$15 off orders over $100', 'fixed', 15, 100, true)
ON CONFLICT (code) DO NOTHING;
