# Task 5 Report

**Status:** COMPLETE

**Commit:** `8501b3c`

**Build:** ✓ Compiled successfully — static page `/` 47.6 kB, no errors or warnings.

## Files created/modified
- `components/home/HeroSection.tsx` — hero with Framer Motion, 2 pill CTAs, stats, Unsplash image
- `components/home/CategoryGrid.tsx` — 2x2 / 4-col category grid with hover effects
- `components/shop/ProductCard.tsx` — shared card with quick-add, SALE badge, wishlist button
- `components/home/NewArrivalsCarousel.tsx` — 4-col grid of first 8 products
- `components/home/TrustSection.tsx` — dark red trust badges (Truck, ShieldCheck, Headphones)
- `components/home/BrandCarousel.tsx` — marquee of doubled brand names
- `app/page.tsx` — composes all 5 sections
- `next.config.mjs` — added remotePatterns for images.unsplash.com and picsum.photos

## Fix applied
`useCartStore` does not accept a selector; changed `useCartStore(s => s.addItem)` → `const { addItem } = useCartStore()`.
