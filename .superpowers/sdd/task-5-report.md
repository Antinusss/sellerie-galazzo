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

---

## Follow-up Fixes (2026-06-29)

**Commit:** `de61cfa`

### Fix 1: Marquee CSS Animation
- **Status:** Already present in `app/globals.css` (lines 14-20)
- **Action:** None required — `.marquee` class and `@keyframes marquee` already defined in `@layer utilities`

### Fix 2: NewArrivalsCarousel Grid Breakpoints
- **File:** `components/home/NewArrivalsCarousel.tsx:18`
- **Change:** Removed intermediate breakpoint `md:grid-cols-3`
- **Before:** `className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"`
- **After:** `className="grid grid-cols-2 lg:grid-cols-4 gap-5"`
- **Result:** Grid now uses 2 columns on mobile, 4 columns on desktop (lg+)

**Build Result:** ✓ Compiled successfully — no errors, no warnings.
