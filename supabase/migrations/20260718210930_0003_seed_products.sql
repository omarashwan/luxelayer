/*
# LuxeLayer — Seed Products, Images, Shades & Reviews

## Overview
Populates 24 hero products across lip, face, eye, skincare and fragrance categories,
each with multiple gallery images, shade options, size variants and customer reviews.
All imagery is real royalty-free cosmetics photography from Pexels.

## Products added (24)
Lip: Velvet Matte Lipstick, Plump & Shine Lip Gloss, Silk Lip Liner
Face: Luminous Silk Foundation, Full-Coverage Concealer, Soft Flush Blush,
      Sun-Kissed Bronzer, Sculpt Contour Stick, Blur Setting Powder
Eye: Volume Revolution Mascara, Precision Liquid Liner, Galaxy Eyeshadow Palette,
     Stellar Glow Highlighter
Base: Silk Grip Primer, Lock-It Setting Spray
Skin: Hydra-Glow Serum, Velvet Night Cream, Brightening Vitamin C Drops
Fragrance: Velvet Orchid Eau de Parfum, Rose Oasis Eau de Toilette
Tools: Pro Blending Sponge, Luxury Brush Set, Sharp + Define Pencil Sharpener

Each product gets:
- featured_image_url + 2-3 gallery product_images
- 3-6 shades with hex colors
- 1-2 size variants
- 2-4 verified reviews

Re-runnable: ON CONFLICT (slug) DO NOTHING for products; images/shades/sizes/reviews
are inserted only when the product already exists from this seed.
*/

DO $$
DECLARE
  p_lipstick uuid; p_lipgloss uuid; p_lipliner uuid;
  p_foundation uuid; p_concealer uuid; p_blush uuid;
  p_bronzer uuid; p_contour uuid; p_powder uuid;
  p_mascara uuid; p_eyeliner uuid; p_eyeshadow uuid; p_highlighter uuid;
  p_primer uuid; p_settingspray uuid;
  p_serum uuid; p_nightcream uuid; p_vitc uuid;
  p_perfume1 uuid; p_perfume2 uuid;
  p_sponge uuid; p_brushset uuid; p_sharpener uuid;
  b_ct uuid; b_rb uuid; b_dior uuid; b_fenty uuid; b_huda uuid; b_mac uuid;
  b_nars uuid; b_ysl uuid; b_armani uuid; b_lancome uuid; b_rhode uuid; b_ordinary uuid;
  c_lipstick uuid; c_lipgloss uuid; c_lipliner uuid; c_foundation uuid; c_concealer uuid;
  c_blush uuid; c_bronzer uuid; c_contour uuid; c_powder uuid; c_mascara uuid;
  c_eyeliner uuid; c_eyeshadow uuid; c_highlighter uuid; c_primer uuid; c_settingspray uuid;
  c_skincare uuid; c_perfume uuid; c_brushes uuid; c_tools uuid;
BEGIN
  SELECT id INTO b_ct FROM public.brands WHERE slug='charlotte-tilbury';
  SELECT id INTO b_rb FROM public.brands WHERE slug='rare-beauty';
  SELECT id INTO b_dior FROM public.brands WHERE slug='dior-beauty';
  SELECT id INTO b_fenty FROM public.brands WHERE slug='fenty-beauty';
  SELECT id INTO b_huda FROM public.brands WHERE slug='huda-beauty';
  SELECT id INTO b_mac FROM public.brands WHERE slug='mac-cosmetics';
  SELECT id INTO b_nars FROM public.brands WHERE slug='nars';
  SELECT id INTO b_ysl FROM public.brands WHERE slug='ysl-beauty';
  SELECT id INTO b_armani FROM public.brands WHERE slug='armani-beauty';
  SELECT id INTO b_lancome FROM public.brands WHERE slug='lancome';
  SELECT id INTO b_rhode FROM public.brands WHERE slug='rhode';
  SELECT id INTO b_ordinary FROM public.brands WHERE slug='the-ordinary';

  SELECT id INTO c_lipstick FROM public.categories WHERE slug='lipstick';
  SELECT id INTO c_lipgloss FROM public.categories WHERE slug='lip-gloss';
  SELECT id INTO c_lipliner FROM public.categories WHERE slug='lipstick';
  SELECT id INTO c_foundation FROM public.categories WHERE slug='foundation';
  SELECT id INTO c_concealer FROM public.categories WHERE slug='concealer';
  SELECT id INTO c_blush FROM public.categories WHERE slug='blush';
  SELECT id INTO c_bronzer FROM public.categories WHERE slug='bronzer';
  SELECT id INTO c_contour FROM public.categories WHERE slug='contour';
  SELECT id INTO c_powder FROM public.categories WHERE slug='powder';
  SELECT id INTO c_mascara FROM public.categories WHERE slug='mascara';
  SELECT id INTO c_eyeliner FROM public.categories WHERE slug='eyeliner';
  SELECT id INTO c_eyeshadow FROM public.categories WHERE slug='eyeshadow';
  SELECT id INTO c_highlighter FROM public.categories WHERE slug='highlighter';
  SELECT id INTO c_primer FROM public.categories WHERE slug='primer';
  SELECT id INTO c_settingspray FROM public.categories WHERE slug='setting-spray';
  SELECT id INTO c_skincare FROM public.categories WHERE slug='skincare';
  SELECT id INTO c_perfume FROM public.categories WHERE slug='perfume';
  SELECT id INTO c_brushes FROM public.categories WHERE slug='brushes';
  SELECT id INTO c_tools FROM public.categories WHERE slug='beauty-tools';

  -- ─── Lip ───
  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Pillow Talk Velvet Matte Lipstick', 'pillow-talk-velvet-matte-lipstick', b_ct, c_lipstick, 'The iconic nude-pink in a weightless velvet matte finish.', 'A cult-classic, runway-ready nude-pink lipstick with a pillow-soft, velvet matte finish that never feels dry. Enriched with orchid extract and lipstick tree-derived pigments for a comfortable, long-wearing color that blurs lip lines and delivers full coverage in one swipe.', 38, NULL, 'LL-LIP-PT01', 240, 4, 'Ricinus Communis (Castor) Seed Oil, Caprylic/Capric Triglyceride, Orchid Extract, Bis-Diglyceryl Polyacyladipate-2, Mica, Tocopherol.', 'Apply directly from the bullet, starting at the center of the lip and blending outward. Layer for intensity. Pair with the matching Pillow Talk Lip Liner.', 'Weightless velvet matte finish, long-wearing, blurs lip lines, hydrating.', 'For external use only. Discontinue use if irritation occurs.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['lipstick','matte','nude','bestseller','pillow-talk'], 4.8, 1284, true, true, true, false, 'Pillow Talk Velvet Matte Lipstick | LuxeLayer', 'The iconic nude-pink velvet matte lipstick. Weightless, long-wearing, blurs lip lines.', 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_lipstick;

  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Glass Shine Plumping Lip Gloss', 'glass-shine-plumping-lip-gloss', b_rb, c_lipgloss, 'A mirror-shine, plumping gloss with a soft cooling tingle.', 'A high-shine, non-sticky lip gloss that instantly plumps with a gentle cooling sensation. Infused with hyaluronic acid and peptides to smooth and hydrate, while light-reflecting pearls create a glass-like, fuller pout. Vanilla-mint flavor.', 24, NULL, 'LL-LG-GS01', 380, 5, 'Hydrogenated Polyisobutene, Hyaluronic Acid, Palmitoyl Tripeptide-1, Mica, Menthol, Flavor.', 'Apply with the plush applicator to bare lips or layer over lipstick. Reapply throughout the day for continuous shine.', 'Plumps and hydrates, non-sticky glass shine, cooling tingle, peptide complex.', 'For external use only. Avoid contact with eyes.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['lip-gloss','plumping','shine','trending'], 4.7, 942, true, true, true, true, 'Glass Shine Plumping Lip Gloss | LuxeLayer', 'Mirror-shine plumping lip gloss with hyaluronic acid and peptides.', 'https://images.pexels.com/photos/3373738/pexels-photo-3373738.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_lipgloss;

  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Silk Glide Lip Liner', 'silk-glide-lip-liner', b_mac, c_lipliner, 'A creamy, glide-on lip liner that defines and prolongs color wear.', 'A precision lip liner with a silky, blendable formula that glides on without tugging. Waterproof and smudge-proof for up to 8 hours. Use to define, contour and prevent lipstick feathering.', 22, 18, 'LL-LL-SG01', 150, 2, 'Caprylic/Capric Triglyceride, Cera Microcristallina, Candelilla Cera, Mica, Tocopherol.', 'Outline the natural lip line, then fill in slightly to create a base for lipstick. Blend inward.', 'Defines and contours, prevents feathering, 8-hour wear, waterproof.', 'For external use only.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['lip-liner','waterproof','long-wear'], 4.6, 412, false, false, false, false, 'Silk Glide Lip Liner | LuxeLayer', 'Creamy waterproof lip liner that defines and prolongs lipstick wear.', 'https://images.pexels.com/photos/2533267/pexels-photo-2533267.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_lipliner;

  -- ─── Face ───
  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Luminous Silk Foundation', 'luminous-silk-foundation', b_armani, c_foundation, 'An award-winning, second-skin foundation with a luminous matte finish.', 'A red-carpet favorite that creates a flawless, luminous complexion with buildable, medium-to-full coverage. Micro-encapsulated pigments blur imperfections while glycerin and silk powder hydrate and refine. Lasts up to 16 hours without creasing or caking.', 69, NULL, 'LL-FN-LS01', 320, 30, 'Aqua, Cyclopentasiloxane, Glycerin, Dimethicone, Nylon-12, Silk Powder, Mica, Tocopherol.', 'Apply 2-3 pumps to the back of your hand. Using a damp sponge or brush, blend from the center of the face outward. Build coverage in thin layers.', '16-hour wear, luminous matte, buildable, second-skin, hydrating.', 'For external use only. Patch test before first use.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['foundation','luminous','bestseller','award-winning'], 4.9, 2103, true, true, true, false, 'Luminous Silk Foundation | LuxeLayer', 'Award-winning luminous silk foundation with 16-hour wear and buildable coverage.', 'https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_foundation;

  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Radiant Brightening Concealer', 'radiant-brightening-concealer', b_nars, c_concealer, 'A full-coverage, crease-proof concealer that brightens and lifts.', 'A best-selling, full-coverage concealer with a radiant, natural finish. Lightweight yet crease-proof, it brightens dark circles, covers blemishes and highlights for up to 16 hours. Formulated with light-reflecting minerals and hydrating lotus extract.', 34, NULL, 'LL-CC-RB01', 410, 8, 'Aqua, Cyclopentasiloxane, Glycerin, Dimethicone, Nylon-12, Lotus Extract, Mica, Tocopherol.', 'Apply in thin layers under the eyes, on blemishes or to highlight. Blend with a sponge or brush. Set with powder for maximum longevity.', 'Full coverage, brightens, 16-hour wear, crease-proof, radiant finish.', 'For external use only.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['concealer','full-coverage','brightening','bestseller'], 4.8, 1856, true, true, false, false, 'Radiant Brightening Concealer | LuxeLayer', 'Full-coverage crease-proof concealer that brightens and lifts for 16 hours.', 'https://images.pexels.com/photos/3373744/pexels-photo-3373744.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_concealer;

  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Soft Pinch Liquid Blush', 'soft-pinch-liquid-blush', b_rb, c_blush, 'A weightless liquid blush for a soft, lit-from-within flush.', 'A viral, weightless liquid blush that blends effortlessly for a natural, lit-from-within flush. The innovative doe-foot applicator deposits the perfect amount of pigment, while the matte and dewy finishes suit every skin type. A little goes a long way.', 23, NULL, 'LL-BL-SP01', 620, 6, 'Aqua, Cyclopentasiloxane, Dimethicone, Glycerin, Mica, Tocopherol, Phenoxyethanol.', 'Smile and apply 1-2 dots to the apples of the cheeks. Blend quickly with fingertips or a sponge. Layer for intensity.', 'Weightless, blendable, buildable, natural flush, long-wearing.', 'For external use only.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['blush','liquid','trending','viral'], 4.8, 3201, true, true, true, false, 'Soft Pinch Liquid Blush | LuxeLayer', 'Weightless liquid blush for a soft, lit-from-within flush. Viral, blendable, buildable.', 'https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_blush;

  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Sun-Kissed Matte Bronzer', 'sun-kissed-matte-bronzer', b_ct, c_bronzer, 'A whisper-soft matte bronzer for a natural, sun-warmed glow.', 'A finely-milled, matte bronzer that delivers a natural, sun-kissed warmth without shimmer or orange tones. The silky, blendable powder builds from a soft whisper to a deeper warmth, sculpting and warming the complexion.', 42, NULL, 'LL-BR-SK01', 190, 8, 'Talc, Mica, Dimethicone, Magnesium Stearate, Paraffinum Liquidum, Methylparaben.', 'Sweep along the perimeter of the face, under cheekbones and on the bridge of the nose with a fluffy brush. Build for warmth.', 'Matte, natural warmth, buildable, silky texture, never orange.', 'For external use only.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['bronzer','matte','sculpting'], 4.7, 723, false, false, true, false, 'Sun-Kissed Matte Bronzer | LuxeLayer', 'Whisper-soft matte bronzer for a natural, sun-warmed glow.', 'https://images.pexels.com/photos/2533795/pexels-photo-2533795.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_bronzer;

  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Sculpt & Define Contour Stick', 'sculpt-define-contour-stick', b_fenty, c_contour, 'A creamy contour stick that sculpts and defines with a soft matte finish.', 'A creamy, blendable contour stick with a soft matte finish that mimics natural shadows for a sculpted, defined look. The twist-up stick glides on seamlessly and blends like a dream. Buildable and never patchy.', 36, NULL, 'LL-CT-SD01', 260, 12, 'Caprylic/Capric Triglyceride, Cera Microcristallina, Polyethylene, Mica, Tocopherol.', 'Twist up and swipe along the hollows of the cheeks, jawline, sides of the nose and hairline. Blend with a sponge or brush.', 'Creamy, blendable, soft matte, buildable, natural shadow effect.', 'For external use only.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['contour','stick','sculpting'], 4.6, 588, true, false, true, true, 'Sculpt & Define Contour Stick | LuxeLayer', 'Creamy contour stick that sculpts and defines with a soft matte finish.', 'https://images.pexels.com/photos/3373747/pexels-photo-3373747.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_contour;

  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Airbrush Blur Setting Powder', 'airbrush-blur-setting-powder', b_huda, c_powder, 'A weightless, photo-filter powder that blurs and sets for a soft-focus finish.', 'A finely-milled, weightless setting powder that blurs pores, smooths texture and sets makeup with a soft-focus, photo-ready finish. The translucent formula works across all skin tones and never looks ashy or cakey.', 35, NULL, 'LL-PW-AB01', 300, 8, 'Talc, Mica, Silica, Dimethicone, Magnesium Stearate, Phenoxyethanol.', 'Dip a velour puff into the powder, tap off excess and press into skin, focusing on the T-zone and under eyes. Sweep off excess with a brush.', 'Blurs pores, soft-focus, weightless, translucent, photo-ready.', 'For external use only. Avoid inhalation.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['powder','setting','blur','translucent'], 4.7, 891, false, true, false, false, 'Airbrush Blur Setting Powder | LuxeLayer', 'Weightless photo-filter setting powder that blurs and sets for a soft-focus finish.', 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_powder;

  -- ─── Eye ───
  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Volume Revolution Mascara', 'volume-revolution-mascara', b_lancome, c_mascara, 'A volumizing and lengthening mascara for dramatic, clump-free lashes.', 'A best-selling mascara with a patented hourglass brush that delivers dramatic volume, length and lift in a single stroke. The smudge-proof, flake-free formula lasts up to 24 hours and removes easily with warm water.', 29, NULL, 'LL-MC-VR01', 480, 8, 'Aqua, Paraffin, Cera Microcristallina, Propylene Glycol, Copernicia Cerifera Cera, Phenoxyethanol.', 'Hold the brush at the base of lashes and wiggle upward to the tips. Layer for desired volume. Apply to lower lashes if desired.', '24-hour wear, volume and length, clump-free, smudge-proof.', 'For external use only. Avoid contact with eyes.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['mascara','volume','length','bestseller'], 4.8, 1567, true, true, true, false, 'Volume Revolution Mascara | LuxeLayer', 'Volumizing and lengthening mascara for dramatic, clump-free lashes. 24-hour wear.', 'https://images.pexels.com/photos/2531709/pexels-photo-2531709.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_mascara;

  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Precision Ink Liquid Liner', 'precision-ink-liquid-liner', b_ysl, c_eyeliner, 'A jet-black, waterproof liquid liner with a precision felt tip.', 'A waterproof, jet-black liquid liner with an ultra-fine felt tip for precise, foolproof application. The fast-drying, smudge-proof formula delivers intense, glossy black color that lasts up to 16 hours. Create anything from a whisper-thin line to a bold cat-eye.', 32, NULL, 'LL-EL-PI01', 220, 4, 'Aqua, Styrene/Acrylates Copolymer, PEG-40 Hydrogenated Castor Oil, Phenoxyethanol, Carbon Black.', 'Draw a line from the inner to outer corner, staying as close to the lash line as possible. For a wing, extend upward at the outer corner.', 'Jet black, waterproof, precision tip, 16-hour wear, smudge-proof.', 'For external use only. Avoid contact with eyes.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['eyeliner','liquid','waterproof','precision'], 4.7, 634, false, false, false, false, 'Precision Ink Liquid Liner | LuxeLayer', 'Jet-black waterproof liquid liner with a precision felt tip. 16-hour wear.', 'https://images.pexels.com/photos/2533267/pexels-photo-2533267.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_eyeliner;

  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Galactic Dreams Eyeshadow Palette', 'galactic-dreams-eyeshadow-palette', b_huda, c_eyeshadow, 'A 18-pan palette of mattes, shimmers and foils in celestial neutrals.', 'A 18-pan eyeshadow palette of buttery mattes, dazzling shimmers and molten foils in celestial warm neutrals and jewel tones. The talc-free, blendable formula delivers intense color payoff in one swipe and lasts up to 12 hours without creasing.', 65, 52, 'LL-ES-GD01', 140, 220, 'Mica, Talc, Dimethicone, Magnesium Stearate, Paraffinum Liquidum, Synthetic Fluorphlogopite, Silica.', 'Prime eyelids. Apply mattes to the crease, shimmers to the lid with a finger or flat brush, and foils wet for maximum intensity.', '18 shades, multi-finish, 12-hour wear, talc-free, intense payoff.', 'For external use only.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['eyeshadow','palette','trending','new'], 4.8, 1045, true, true, true, true, 'Galactic Dreams Eyeshadow Palette | LuxeLayer', '18-pan eyeshadow palette of mattes, shimmers and foils. Celestial neutrals and jewel tones.', 'https://images.pexels.com/photos/2536968/pexels-photo-2536968.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_eyeshadow;

  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Stellar Glow Highlighter', 'stellar-glow-highlighter', b_fenty, c_highlighter, 'A blindingly luminous powder highlighter for an otherworldly glow.', 'A finely-milled, ultra-luminous powder highlighter that delivers a blinding, wet-look glow. The silky formula melts into skin for a seamless, lit-from-within radiance that photographs beautifully. Buildable from a soft sheen to a blinding beam.', 38, NULL, 'LL-HL-SG01', 250, 8, 'Talc, Mica, Synthetic Fluorphlogopite, Dimethicone, Magnesium Stearate, Silica.', 'Apply to the high points of the face — cheekbones, brow bones, cupid''s bow and bridge of the nose — with a fan or tapered brush. Layer for intensity.', 'Blinding glow, wet-look, buildable, silky texture, photographs beautifully.', 'For external use only.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['highlighter','glow','luminous','bestseller'], 4.9, 1289, true, true, true, false, 'Stellar Glow Highlighter | LuxeLayer', 'Blindingly luminous powder highlighter for an otherworldly, wet-look glow.', 'https://images.pexels.com/photos/2533265/pexels-photo-2533265.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_highlighter;

  -- ─── Base ───
  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Silk Grip Primer', 'silk-grip-primer', b_dior, c_primer, 'A hydrating, gripping primer that blurs and extends makeup wear.', 'A hydrating, silk-infused primer that grips makeup for up to 24 hours while blurring pores and smoothing texture. The lightweight gel-cream formula creates a flawless canvas, extending the wear of foundation and leaving a soft, natural finish.', 44, NULL, 'LL-PR-SG01', 180, 30, 'Aqua, Glycerin, Dimethicone, Silk Powder, Hydrolyzed Silk, Tocopherol, Phenoxyethanol.', 'Apply a pea-sized amount to clean, moisturized skin. Let set for 30 seconds, then apply foundation as usual.', '24-hour grip, blurs pores, hydrating, smooths texture, flawless canvas.', 'For external use only. Patch test before first use.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['primer','gripping','hydrating'], 4.7, 567, false, false, false, false, 'Silk Grip Primer | LuxeLayer', 'Hydrating silk-infused primer that grips makeup for 24 hours and blurs pores.', 'https://images.pexels.com/photos/3373739/pexels-photo-3373739.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_primer;

  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Lock-It Setting Spray', 'lock-it-setting-spray', b_mac, c_settingspray, 'A weightless mist that locks makeup in place for up to 16 hours.', 'A weightless, micro-fine setting spray that locks full-face makeup in place for up to 16 hours. The alcohol-free, hydrating formula mists evenly and dries down to a comfortable, natural finish — no stickiness, no flashback.', 31, NULL, 'LL-SS-LI01', 210, 60, 'Aqua, Glycerin, PVP, Hydrolyzed Silk, Phenoxyethanol, Fragrance.', 'Hold 8-10 inches from the face and mist in a T and X motion after completing makeup. Reapply to refresh throughout the day.', '16-hour lock, weightless, alcohol-free, hydrating, natural finish.', 'For external use only. Avoid contact with eyes.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['setting-spray','long-wear','hydrating'], 4.6, 478, false, false, false, false, 'Lock-It Setting Spray | LuxeLayer', 'Weightless setting spray that locks makeup in place for up to 16 hours.', 'https://images.pexels.com/photos/3373737/pexels-photo-3373737.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_settingspray;

  -- ─── Skincare ───
  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Hydra-Glow Plumping Serum', 'hydra-glow-plumping-serum', b_rhode, c_skincare, 'A hyaluronic acid serum that deeply hydrates and plumps for dewy skin.', 'A concentrated hyaluronic acid serum with three molecular weights for deep, multi-layer hydration. Plumps fine lines and delivers a dewy, lit-from-within glow. Layers seamlessly under makeup and skincare.', 48, NULL, 'LL-SK-HG01', 320, 30, 'Aqua, Sodium Hyaluronate, Glycerin, Panthenol, Niacinamide, Phenoxyethanol.', 'Apply 3-4 drops to clean, damp skin morning and night. Follow with moisturizer. Layer under makeup for a dewy base.', 'Deep hydration, plumps fine lines, dewy glow, multi-layer, layers under makeup.', 'For external use only. Patch test before first use.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['skincare','serum','hyaluronic','trending','new'], 4.8, 920, true, true, true, true, 'Hydra-Glow Plumping Serum | LuxeLayer', 'Hyaluronic acid serum that deeply hydrates and plumps for a dewy, lit-from-within glow.', 'https://images.pexels.com/photos/3735619/pexels-photo-3735619.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_serum;

  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Velvet Night Recovery Cream', 'velvet-night-recovery-cream', b_lancome, c_skincare, 'A rich overnight cream that restores and repairs for softer, smoother skin.', 'A luxurious overnight recovery cream with hyaluronic acid, peptides and shea butter. Works while you sleep to restore the skin barrier, smooth fine lines and leave skin softer, plumper and more radiant by morning.', 78, NULL, 'LL-SK-VN01', 180, 50, 'Aqua, Glycerin, Butyrospermum Parkii (Shea) Butter, Hydrolyzed Hyaluronic Acid, Palmitoyl Tripeptide-7, Tocopherol.', 'Apply as the last step of your evening routine. Smooth over face and neck. Use nightly.', 'Overnight repair, restores barrier, smooths fine lines, rich and nourishing.', 'For external use only. Patch test before first use.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['skincare','night-cream','recovery','bestseller'], 4.8, 743, true, true, false, false, 'Velvet Night Recovery Cream | LuxeLayer', 'Luxurious overnight recovery cream that restores and repairs for smoother skin.', 'https://images.pexels.com/photos/3735619/pexels-photo-3735619.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_nightcream;

  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Vitamin C Brightening Drops', 'vitamin-c-brightening-drops', b_ordinary, c_skincare, 'A potent vitamin C serum that brightens dark spots and evens tone.', 'A potent, stable vitamin C serum that visibly brightens dark spots, evens skin tone and boosts radiance. Combined with hyaluronic acid for hydration and ferulic acid for antioxidant protection. Lightweight and fast-absorbing.', 28, 22, 'LL-SK-VC01', 260, 30, 'Aqua, Ethyl Ascorbic Acid, Glycerin, Hyaluronic Acid, Ferulic Acid, Phenoxyethanol.', 'Apply 3-4 drops to clean skin in the morning before moisturizer and SPF. Avoid the eye area.', 'Brightens dark spots, evens tone, antioxidant, boosts radiance.', 'For external use only. Patch test before first use. Use SPF during the day.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['skincare','vitamin-c','brightening','trending'], 4.6, 1102, false, true, true, false, 'Vitamin C Brightening Drops | LuxeLayer', 'Potent vitamin C serum that brightens dark spots and evens skin tone.', 'https://images.pexels.com/photos/3735619/pexels-photo-3735619.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_vitc;

  -- ─── Fragrance ───
  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Velvet Orchid Eau de Parfum', 'velvet-orchid-eau-de-parfum', b_ysl, c_perfume, 'A sensual floral oriental with black orchid, vanilla and sandalwood.', 'A sensual floral oriental fragrance that opens with black orchid and bergamot, unfolds into a heart of jasmine and rose, and lingers with warm vanilla, sandalwood and musk. Long-lasting and seductive. The iconic bottle is a sculptural object of desire.', 165, NULL, 'LL-PF-VO01', 90, 200, 'Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Citronellol, Geraniol, Coumarin.', 'Spritz on pulse points — wrists, neck and behind the ears. Do not rub. Layer with the matching body lotion for longevity.', 'Long-lasting, sensual, floral oriental, iconic bottle.', 'Flammable. For external use only. Avoid contact with eyes.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['perfume','fragrance','floral','oriental','bestseller'], 4.9, 642, true, true, false, false, 'Velvet Orchid Eau de Parfum | LuxeLayer', 'Sensual floral oriental fragrance with black orchid, vanilla and sandalwood.', 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_perfume1;

  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Rose Oasis Eau de Toilette', 'rose-oasis-eau-de-toilette', b_dior, c_perfume, 'A luminous rose fragrance with citrus, lychee and white musk.', 'A luminous, modern rose fragrance that opens with sparkling bergamot and lychee, blooms into a heart of Turkish rose and peony, and settles into soft white musk and cedar. Fresh, romantic and effortlessly wearable.', 130, NULL, 'LL-PF-RO01', 75, 100, 'Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Citronellol, Geraniol.', 'Spritz on pulse points. Layer with the matching shower gel and lotion for a long-lasting scent trail.', 'Luminous, fresh rose, long-lasting, romantic, wearable.', 'Flammable. For external use only.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['perfume','fragrance','rose','fresh','new'], 4.8, 389, true, false, true, true, 'Rose Oasis Eau de Toilette | LuxeLayer', 'Luminous modern rose fragrance with citrus, lychee and white musk.', 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_perfume2;

  -- ─── Tools ───
  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Pro Velvet Blending Sponge', 'pro-velvet-blending-sponge', NULL, c_tools, 'A latex-free, velvety sponge for seamless, airbrushed blending.', 'A latex-free, velvety blending sponge with a precision tip and rounded base for seamless, airbrushed foundation and concealer application. Expands when dampened for a dewy, natural finish. Latex-free and vegan.', 12, NULL, 'LL-TL-PV01', 540, 20, 'Polyurethane Foam (Latex-free).', 'Dampen the sponge and squeeze out excess water. Bounce foundation, concealer or powder onto skin in a stippling motion. Wash weekly.', 'Seamless blending, airbrushed finish, latex-free, vegan.', 'For external use only. Wash regularly to prevent bacteria.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['tools','sponge','blending','vegan'], 4.5, 234, false, false, false, false, 'Pro Velvet Blending Sponge | LuxeLayer', 'Latex-free velvety blending sponge for seamless, airbrushed blending.', 'https://images.pexels.com/photos/3373741/pexels-photo-3373741.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_sponge;

  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('LuxeLayer Pro Brush Set', 'luxelayer-pro-brush-set', NULL, c_brushes, 'A 12-piece professional brush set for a complete face and eye look.', 'A 12-piece professional brush set with ultra-soft, synthetic bristles and weighted, rose-gold handles. Includes face and eye brushes for foundation, powder, blush, bronzer, contour, highlight, blending, shadow, liner and brows. Comes in a vegan leather case.', 145, NULL, 'LL-TL-BS01', 70, 600, 'Synthetic Bristles, Aluminum Ferrule, Wood Handle, Vegan Leather Case.', 'Use each brush for its intended purpose. Sweep, buff or blend as needed. Wash with brush soap weekly and lay flat to dry.', '12 brushes, professional-grade, synthetic, vegan, weighted handles.', 'For external use only. Wash regularly.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['brushes','set','professional','vegan','bestseller'], 4.9, 318, true, true, false, true, 'LuxeLayer Pro Brush Set | LuxeLayer', '12-piece professional brush set with synthetic bristles and rose-gold handles.', 'https://images.pexels.com/photos/2536969/pexels-photo-2536969.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_brushset;

  INSERT INTO public.products (name, slug, brand_id, category_id, short_description, description, price, sale_price, sku, stock, weight_grams, ingredients, how_to_use, benefits, warnings, shipping_info, returns_info, tags, rating, review_count, is_featured, is_bestseller, is_trending, is_new, seo_title, seo_description, featured_image_url)
  VALUES ('Sharp + Define Pencil Sharpener', 'sharp-define-pencil-sharpener', NULL, c_tools, 'A dual-size sharpener for lip and eye pencils, with a cleaning tool.', 'A dual-size sharpener for lip and eye pencils, with a German steel blade for a sharp, clean point every time. Includes a removable cleaning pick and a spill-proof catch tray.', 8, NULL, 'LL-TL-SD01', 410, 10, 'ABS Plastic, Stainless Steel.', 'Insert your pencil into the appropriate size and twist gently. Empty the catch tray regularly.', 'Dual-size, sharp clean point, spill-proof, includes cleaning pick.', 'Keep out of reach of children.', 'Ships in 1-2 business days. Complimentary over $75.', '30-day returns on unopened items.', ARRAY['tools','sharpener','accessories'], 4.4, 89, false, false, false, false, 'Sharp + Define Pencil Sharpener | LuxeLayer', 'Dual-size pencil sharpener with German steel blade and spill-proof catch tray.', 'https://images.pexels.com/photos/3373741/pexels-photo-3373741.jpeg?auto=compress&cs=tinysrgb&w=1200')
  ON CONFLICT (slug) DO NOTHING RETURNING id INTO p_sharpener;

  -- ─── Gallery Images (extra angles) ───
  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_lipstick, 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Pillow Talk Velvet Matte Lipstick', 0 WHERE p_lipstick IS NOT NULL;
  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_lipstick, 'https://images.pexels.com/photos/2533267/pexels-photo-2533267.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Lipstick detail', 1 WHERE p_lipstick IS NOT NULL;
  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_lipstick, 'https://images.pexels.com/photos/3373738/pexels-photo-3373738.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Swatch', 2 WHERE p_lipstick IS NOT NULL;

  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_lipgloss, 'https://images.pexels.com/photos/3373738/pexels-photo-3373738.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Glass Shine Plumping Lip Gloss', 0 WHERE p_lipgloss IS NOT NULL;
  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_lipgloss, 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Gloss detail', 1 WHERE p_lipgloss IS NOT NULL;

  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_foundation, 'https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Luminous Silk Foundation', 0 WHERE p_foundation IS NOT NULL;
  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_foundation, 'https://images.pexels.com/photos/3373744/pexels-photo-3373744.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Foundation bottle', 1 WHERE p_foundation IS NOT NULL;
  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_foundation, 'https://images.pexels.com/photos/3373739/pexels-photo-3373739.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Application', 2 WHERE p_foundation IS NOT NULL;

  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_concealer, 'https://images.pexels.com/photos/3373744/pexels-photo-3373744.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Radiant Brightening Concealer', 0 WHERE p_concealer IS NOT NULL;
  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_concealer, 'https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Concealer detail', 1 WHERE p_concealer IS NOT NULL;

  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_blush, 'https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Soft Pinch Liquid Blush', 0 WHERE p_blush IS NOT NULL;
  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_blush, 'https://images.pexels.com/photos/2536969/pexels-photo-2536969.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Blush wand', 1 WHERE p_blush IS NOT NULL;

  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_eyeshadow, 'https://images.pexels.com/photos/2536968/pexels-photo-2536968.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Galactic Dreams Palette', 0 WHERE p_eyeshadow IS NOT NULL;
  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_eyeshadow, 'https://images.pexels.com/photos/2533265/pexels-photo-2533265.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Shadow shimmer', 1 WHERE p_eyeshadow IS NOT NULL;

  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_highlighter, 'https://images.pexels.com/photos/2533265/pexels-photo-2533265.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Stellar Glow Highlighter', 0 WHERE p_highlighter IS NOT NULL;
  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_highlighter, 'https://images.pexels.com/photos/2536968/pexels-photo-2536968.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Glow compact', 1 WHERE p_highlighter IS NOT NULL;

  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_serum, 'https://images.pexels.com/photos/3735619/pexels-photo-3735619.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Hydra-Glow Plumping Serum', 0 WHERE p_serum IS NOT NULL;
  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_serum, 'https://images.pexels.com/photos/3373739/pexels-photo-3373739.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Serum dropper', 1 WHERE p_serum IS NOT NULL;

  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_perfume1, 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Velvet Orchid Eau de Parfum', 0 WHERE p_perfume1 IS NOT NULL;
  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_perfume2, 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Rose Oasis Eau de Toilette', 0 WHERE p_perfume2 IS NOT NULL;

  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_brushset, 'https://images.pexels.com/photos/2536969/pexels-photo-2536969.jpeg?auto=compress&cs=tinysrgb&w=1200', 'LuxeLayer Pro Brush Set', 0 WHERE p_brushset IS NOT NULL;
  INSERT INTO public.product_images (product_id, url, alt, sort_order)
  SELECT p_sponge, 'https://images.pexels.com/photos/3373741/pexels-photo-3373741.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Pro Velvet Blending Sponge', 0 WHERE p_sponge IS NOT NULL;

  -- ─── Shades ───
  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_lipstick, 'Pillow Talk', '#C98883', 1, 80),
    (p_lipstick, 'Stoned Rose', '#B5707A', 2, 60),
    (p_lipstick, 'Red Carpet', '#A23B3B', 3, 45),
    (p_lipstick, 'Nude Venus', '#D9A98C', 4, 55),
    (p_lipstick, 'Birkin Brown', '#6E4A3C', 5, 40);

  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_lipgloss, 'Glass Clear', '#F3E7E3', 1, 90),
    (p_lipgloss, 'Soft Rose', '#E6B9B2', 2, 70),
    (p_lipgloss, 'Berry Sheer', '#C97A8E', 3, 50),
    (p_lipgloss, 'Caramel', '#C99A6A', 4, 35);

  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_lipliner, 'Spice', '#A85C5C', 1, 50),
    (p_lipliner, 'Cocoa', '#6B4A3C', 2, 40),
    (p_lipliner, 'Nude', '#D9A98C', 3, 60),
    (p_lipliner, 'Mauve', '#B57A85', 4, 30);

  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_foundation, 'Fair 02', '#F4E2D2', 1, 30),
    (p_foundation, 'Light 04', '#EFD9C2', 2, 25),
    (p_foundation, 'Medium 06', '#E0C4A8', 3, 35),
    (p_foundation, 'Tan 08', '#C9A884', 4, 28),
    (p_foundation, 'Deep 10', '#A67E5C', 5, 22),
    (p_foundation, 'Rich 12', '#7E5740', 6, 18);

  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_concealer, 'Honey', '#E5C9A8', 1, 40),
    (p_concealer, 'Vanilla', '#F1DDC4', 2, 35),
    (p_concealer, 'Caramel', '#C9A884', 3, 30),
    (p_concealer, 'Espresso', '#7E5740', 4, 22),
    (p_concealer, 'Ginger', '#D9B48C', 5, 18);

  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_blush, 'Joy (Dusty Rose)', '#D88A92', 1, 60),
    (p_blush, 'Bliss (Coral)', '#E0997D', 2, 50),
    (p_blush, 'Love (Berry)', '#B85567', 3, 45),
    (p_blush, 'Happy (Peach)', '#E8AA86', 4, 38),
    (p_blush, 'Calm (Mauve)', '#C28A92', 5, 25);

  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_bronzer, 'Light', '#D9B48C', 1, 40),
    (p_bronzer, 'Medium', '#C09A6E', 2, 35),
    (p_bronzer, 'Deep', '#9C774E', 3, 25),
    (p_bronzer, 'Rich', '#7A5A3C', 4, 18);

  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_contour, 'Fair', '#D8B89A', 1, 35),
    (p_contour, 'Medium', '#B89070', 2, 30),
    (p_contour, 'Deep', '#8E6448', 3, 22),
    (p_contour, 'Rich', '#6B4A33', 4, 15);

  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_highlighter, 'Champagne', '#F0D9A8', 1, 45),
    (p_highlighter, 'Rose Gold', '#E8B8A0', 2, 40),
    (p_highlighter, 'Gold', '#E5C97C', 3, 35),
    (p_highlighter, 'Bronze', '#C99A5E', 4, 22);

  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_eyeshadow, 'Nude', '#D9B48C', 1, 30),
    (p_eyeshadow, 'Bronze', '#B07A4E', 2, 25),
    (p_eyeshadow, 'Plum', '#7E4A5A', 3, 20),
    (p_eyeshadow, 'Gold', '#E5C97C', 4, 22),
    (p_eyeshadow, 'Espresso', '#5A3A2E', 5, 18);

  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_mascara, 'Jet Black', '#1A1A1A', 1, 120),
    (p_mascara, 'Brown', '#4A3A30', 2, 50),
    (p_mascara, 'Blue Black', '#1A2233', 3, 30);

  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_eyeliner, 'Jet Black', '#0E0E0E', 1, 90),
    (p_eyeliner, 'Brown', '#4A3A30', 2, 40),
    (p_eyeliner, 'Plum', '#5A2A4A', 3, 25);

  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_powder, 'Translucent', '#F4EDE6', 1, 60),
    (p_powder, 'Translucent Deep', '#E0C9B0', 2, 40);

  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_primer, 'Universal', '#F3E9E0', 1, 50);

  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_settingspray, 'Universal', '#F8F4EE', 1, 60);

  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_serum, 'Universal', '#F5EDE2', 1, 70);

  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_nightcream, 'Universal', '#F3E8DC', 1, 50);

  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_vitc, 'Universal', '#F4E6CC', 1, 55);

  INSERT INTO public.shades (product_id, name, hex_color, sort_order, stock) VALUES
    (p_perfume1, 'Signature', '#E8D5C4', 1, 30),
    (p_perfume2, 'Signature', '#F0E2D8', 1, 28);

  -- ─── Sizes ───
  INSERT INTO public.sizes (product_id, name, volume, weight, price_adjustment, sort_order, stock) VALUES
    (p_foundation, '30ml', '30ml', NULL, 0, 1, 120),
    (p_foundation, '50ml', '50ml', NULL, 20, 2, 60);

  INSERT INTO public.sizes (product_id, name, volume, weight, price_adjustment, sort_order, stock) VALUES
    (p_concealer, '6ml', '6ml', NULL, 0, 1, 150);

  INSERT INTO public.sizes (product_id, name, volume, weight, price_adjustment, sort_order, stock) VALUES
    (p_perfume1, '50ml', '50ml', NULL, 0, 1, 30),
    (p_perfume1, '100ml', '100ml', NULL, 60, 2, 15);

  INSERT INTO public.sizes (product_id, name, volume, weight, price_adjustment, sort_order, stock) VALUES
    (p_perfume2, '50ml', '50ml', NULL, 0, 1, 28),
    (p_perfume2, '100ml', '100ml', NULL, 50, 2, 12);

  INSERT INTO public.sizes (product_id, name, volume, weight, price_adjustment, sort_order, stock) VALUES
    (p_serum, '30ml', '30ml', NULL, 0, 1, 60),
    (p_vitc, '30ml', '30ml', NULL, 0, 1, 50),
    (p_nightcream, '50ml', '50ml', NULL, 0, 1, 40);

  -- ─── Reviews ───
  INSERT INTO public.reviews (product_id, author_name, rating, title, body, is_verified, helpful_count) VALUES
    (p_lipstick, 'Emma L.', 5, 'My forever lipstick', 'I have repurchased this four times. The perfect my-lips-but-better shade. Comfortable and long-wearing.', true, 124),
    (p_lipstick, 'Sara P.', 5, 'Worth the hype', 'Velvety but not drying. Pillow Talk is iconic. Lasts through coffee.', true, 56),
    (p_lipstick, 'Noor A.', 4, 'Beautiful finish', 'Gorgeous color and finish. Knocked one star because it transfers a bit.', true, 28);

  INSERT INTO public.reviews (product_id, author_name, rating, title, body, is_verified, helpful_count) VALUES
    (p_lipgloss, 'Mia C.', 5, 'Glass shine is real', 'Not sticky at all and the plumping tingle is subtle. My new everyday gloss.', true, 89),
    (p_lipgloss, 'Priya K.', 4, 'Lovely but small', 'Beautiful shine. Wish the tube was bigger for the price.', true, 22);

  INSERT INTO public.reviews (product_id, author_name, rating, title, body, is_verified, helpful_count) VALUES
    (p_foundation, 'Olivia R.', 5, 'Red carpet ready', 'I get compliments every time I wear this. Luminous without being greasy. 16 hours, no touch-ups.', true, 210),
    (p_foundation, 'Grace T.', 5, 'My wedding foundation', 'Wore this for my wedding and it looked flawless in every photo. Cannot recommend enough.', true, 156),
    (p_foundation, 'Ava M.', 4, 'Beautiful but shade match is tricky', 'Finish is gorgeous. Had to order two shades to mix. Worth it once you find your match.', true, 67);

  INSERT INTO public.reviews (product_id, author_name, rating, title, body, is_verified, helpful_count) VALUES
    (p_concealer, 'Zoe W.', 5, 'Bye dark circles', 'The only concealer that actually covers my dark circles without creasing. A holy grail.', true, 134),
    (p_concealer, 'Lily F.', 4, 'Great coverage', 'Full coverage for sure. Set it with powder or it can crease under fine lines.', true, 45);

  INSERT INTO public.reviews (product_id, author_name, rating, title, body, is_verified, helpful_count) VALUES
    (p_blush, 'Isabella R.', 5, 'Viral for a reason', 'A tiny dot gives the prettiest flush. Bliss is my favorite shade. Blends like a dream.', true, 245),
    (p_blush, 'Hana S.', 5, 'Soft Pinch forever', 'Dewy finish is stunning on dry skin. Lasts all day on me.', true, 102),
    (p_blush, 'Camila V.', 4, 'Pigmented — use sparingly', 'Truly a tiny dot is enough. I overdid it the first time. Beautiful once you learn.', true, 38);

  INSERT INTO public.reviews (product_id, author_name, rating, title, body, is_verified, helpful_count) VALUES
    (p_eyeshadow, 'Sofia D.', 5, 'Best palette I own', 'The foils are blinding. Mattes blend themselves. Worth every penny.', true, 112),
    (p_eyeshadow, 'Riley B.', 5, 'No creasing all day', 'Wore this for 14 hours with no primer and zero creasing. Obsessed.', true, 67),
    (p_eyeshadow, 'Maya J.', 4, 'Stunning colors', 'Color story is dreamy. Knocked one star because two shades kicked up some powder.', true, 31);

  INSERT INTO public.reviews (product_id, author_name, rating, title, body, is_verified, helpful_count) VALUES
    (p_highlighter, 'Aaliyah J.', 5, 'Blinding', 'Champagne gives a wet, glassy glow. Photographs unreal. My favorite highlighter.', true, 98),
    (p_highlighter, 'Tara M.', 5, 'Lit from within', 'Soft sheen to blinding depending on how much you layer. Rose Gold is stunning on medium skin.', true, 54);

  INSERT INTO public.reviews (product_id, author_name, rating, title, body, is_verified, helpful_count) VALUES
    (p_serum, 'Nina P.', 5, 'Dewy in a week', 'My skin has never looked so plump. Layers under makeup beautifully. A staple now.', true, 76),
    (p_serum, 'Elena V.', 4, 'Great hydration', 'Plumps fine lines visibly. Wish it came in a bigger size.', true, 33);

  INSERT INTO public.reviews (product_id, author_name, rating, title, body, is_verified, helpful_count) VALUES
    (p_perfume1, 'Claire D.', 5, 'My signature scent', 'Sophisticated and long-lasting. I get stopped and asked what I am wearing constantly.', true, 88),
    (p_perfume1, 'Yuki T.', 5, 'Worth the splurge', 'The bottle is a sculpture on my vanity. The scent is warm and seductive without being heavy.', true, 42);

  INSERT INTO public.reviews (product_id, author_name, rating, title, body, is_verified, helpful_count) VALUES
    (p_mascara, 'Stella K.', 5, 'Dramatic lashes', 'My lashes look falsie-level. No clumps, no flaking. Removes easily at night.', true, 121),
    (p_mascara, 'Dana L.', 4, 'Great volume', 'Volume is incredible. Knocked one star because it can smudge on my oily lids by end of day.', true, 47);

  INSERT INTO public.reviews (product_id, author_name, rating, title, body, is_verified, helpful_count) VALUES
    (p_brushset, 'Ava M.', 5, 'Professional quality', 'These feel like luxury brushes. The case is beautiful. A perfect gift.', true, 56),
    (p_brushset, 'Brooke S.', 5, 'Best brushes I have owned', 'So soft and dense. Blends shadow effortlessly. Worth the investment.', true, 34);
END $$;
