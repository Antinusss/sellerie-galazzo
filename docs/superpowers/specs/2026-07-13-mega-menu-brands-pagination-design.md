# Mega Menu, Brands, Breadcrumbs & Pagination — Design Spec

**Date:** 2026-07-13
**Status:** Approved

## Context

The site currently has: a minimal Navbar dropdown (one level of category links only), a text-only `BrandCarousel` on the homepage with no real logos, no dedicated brand pages, non-clickable category breadcrumb text on product pages, and category pages (`/shop/[[...slug]]`) that render every matching product at once (e.g. Monta Inglese alone has 2334 products in one unpaginated grid).

The client wants parity with real competitor sites (reference: kramer.it) — a richer mega menu with category photos, a dedicated brands section using real logos, a lightweight product-guide section, an offers section, a brand section on product pages, clickable breadcrumbs, and pagination.

Reference research done for this spec:
- **kramer.it** (live, inspected via browser): top nav has `Novità / Cavaliere / Cavallo / Temi / Scuderia & Pascolo / Outfits / Offerte / Marche / Buoni / Guida ai prodotti / Mega Stores`. Category dropdowns are multi-column text menus grouped by subcategory headers (2 levels shown: column header = one level, links = children). "Marche" dropdown is a grid of clickable brand logos. "Guida ai prodotti" dropdown is grouped links to care/buying-guide topics.
- **selleriagalazzo.com** (live, inspected via curl): homepage's "I Brand selezionati per voi" carousel has 23 identifiable real logo images matching 23 of our 62 real brand names (case/punctuation differences reconciled below). The real site also already uses `/brand/<slug>/` as its brand-page URL pattern (seen in feed link `https://selleriagalazzo.com/brand/tommy-hilfiger/`) — reused here for consistency with the "match the real site's IA" precedent set in the 2026-07-12 catalog-import spec.

## Decisions

1. **Mega menu category flyouts** (Monta Inglese / Monta Western / Scuderia) show 2 levels: column header = level-2 node name, links below = its level-3 children (a level-2 node with no children renders as a standalone link, no header). Deeper levels stay reachable via the category page's own sidebar tree — not duplicated in the nav. Each flyout also gets a promo image panel (reusing the same real branch photo already used in `CategoryGrid`) with the branch name and a "Scopri tutto →" CTA — this is the "qualche foto" the client asked to add to the mega menu.
2. **New top-level nav items**: "Marche" (brand grid flyout, top 12 by product count + "Vedi tutti →"), "Offerte" (plain link, no flyout), "Guida ai prodotti" (flyout of 8 curated links straight into real, verified category pages — no fabricated articles). The 8 links (verified to exist in `data/categories.json` as of this spec):
   - Cura del cavallo → `/shop/scuderia/cura-del-cavallo` (244 products)
   - Cura del cuoio → `/shop/scuderia/cura-del-cuoio` (20)
   - Attrezzatura da scuderia → `/shop/scuderia/attrezzatura-da-scuderia` (45)
   - Selle e accessori (inglese) → `/shop/monta-inglese/cavallo/selle-e-accessori` (37)
   - Coperte → `/shop/monta-inglese/cavallo/coperte` (135)
   - Protezioni → `/shop/monta-inglese/cavallo/protezioni` (175)
   - Selle e accessori (western) → `/shop/monta-western/cavallo/selle-e-accessori` (41)
   - Briglie e accessori → `/shop/monta-inglese/cavallo/briglie-e-accessori` (82)
3. **Real brand logos**: 23 of 62 brands get a real `logo` URL (extracted from selleriagalazzo.com's own homepage carousel); the other 39 keep the existing styled-text-badge fallback. No placeholder/stock images substituted for missing logos.
4. **Brand pages**: new `/brand/[slug]` route (matches the real site's URL pattern), one per brand (62 static pages), listing that brand's products with the same pagination component as category pages. New `/marche` page: full grid of all 62 brands (logo or text tile), sorted by product count.
5. **Product-page brand section**: new block between the gallery/info grid and the tabs, showing the brand's logo/name and a link to its `/brand/[slug]` page. Renders nothing when `product.brand === ''` (194 products have no brand).
6. **Clickable breadcrumbs**: `ProductInfo`'s category line becomes a chain of links, each segment navigating to that depth's `/shop/...` category page.
7. **Pagination**: 24 products per page, client-side (matches the existing client-state pattern for sort/price filtering — no URL page param, same as sort/price today), Prev/Next + windowed page numbers. Resets to page 1 whenever the underlying product set changes (category navigation, brand navigation, or filter/sort change). A new shared `PaginatedProductGrid` component replaces the bare `.map(ProductCard)` in `ShopCategoryClient` and is reused by the new `/brand/[slug]` and `/offerte` pages.
8. **Offers (explicit, deliberate exception)**: the real feed has no discount data, and the 2026-07-12 spec's Global Constraints explicitly said "no fabricated sale prices." The client has now explicitly asked to override that for this feature. ~1/15 of the catalog (`Number(product.id) % 15 === 0`, ≈204 products, deterministic so re-running the sync script doesn't reshuffle which products are "on offer") gets a fabricated discount of 10/15/20/25/30% (`10 + (Number(id) % 5) * 5`, also deterministic), with `originalPrice` computed backward from the real `price`. This logic lives in a new `lib/offers.ts` — kept separate from `lib/feed-transform.ts` so the "faithful real-feed parsing" module stays free of synthetic data, and the exception is visible/isolated rather than silently mixed in.

## Data Layer Changes

- `lib/types.ts`: `Brand` gains `logo?: string`.
- `lib/offers.ts` (new): `applyOfferPricing(products: Product[]): Product[]` — pure, deterministic, returns a new array with `originalPrice` set on the selected ~204 products (everything else passes through unchanged). Tested.
- `lib/category-tree.ts`: gains `findCategoryByPath(categories: Category[], path: string[]): Category | undefined` (name-path lookup, used to resolve breadcrumb slugs from a product's `categoryPath`). Tested.
- `scripts/sync-product-feed.ts`:
  - New `BRAND_LOGOS: Record<string, string>` constant (23 entries, real URLs, keyed by the *canonical* brand name as it appears in `data/brands.json` — e.g. `'Acavallo'` not `'acavallo'`, `"Pool's"` not `'pool-s'`, `'MASC'` not `'logo masc'`). Applied when building `brands.json`.
  - Calls `applyOfferPricing(products)` before writing `data/products.json`.
- Regenerate `data/products.json` and `data/brands.json` by re-running `npm run sync-feed` once this logic exists.

## Routing Changes

- `app/marche/page.tsx` (new): static page, grid of all 62 brands sorted by `productCount` desc, each tile links to `/brand/[slug]`.
- `app/brand/[slug]/page.tsx` (new): `generateStaticParams` over `data/brands.json` (62 pages). Filters `data/products.json` by `product.brand === brand.name`, renders via `PaginatedProductGrid`. 404s via `notFound()` for an unknown slug.
- `app/offerte/page.tsx` (new): static page, filters `data/products.json` by `originalPrice !== null`, renders via `PaginatedProductGrid`.

## Component Changes

- `components/layout/Navbar.tsx`: rewritten mega-menu. Category flyouts grouped by level-2/level-3 with a promo image panel (image source: the same `IMAGES` map already in `CategoryGrid.tsx`, hoisted to a shared location — see below). New "Marche" flyout (top 12 brand tiles + link), "Offerte" (plain link), "Guida ai prodotti" flyout (8 curated links, hardcoded in the component since they're a fixed editorial choice, not derived data — same reasoning as `CategoryGrid`'s `DESCRIPTIONS` map).
- `IMAGES` map (top-level branch → photo URL) used by both `CategoryGrid` and the new `Navbar` mega menu: hoisted out of `CategoryGrid.tsx` into a small shared constant (`lib/branch-images.ts`) so it isn't duplicated across the two components.
- `components/shop/PaginatedProductGrid.tsx` (new): client component, props `{ products: Product[] }`. Internal page state, 24/page, resets when the `products` array reference changes. Prev/Next + windowed page-number buttons (matches existing site's rounded-pill button style).
- `components/shop/ShopCategoryClient.tsx`: swaps its inline grid for `PaginatedProductGrid`.
- `components/product/BrandSection.tsx` (new): brand logo/name + "Vedi tutti i prodotti di [Brand] →" link to `/brand/[slug]`; renders `null` when `product.brand === ''`.
- `components/product/ProductInfo.tsx`: category line becomes a `<nav>` of `<Link>`s (one per `categoryPath` segment), resolved via `findCategoryByPath`.
- `components/home/BrandCarousel.tsx`: renders `<Image>` when `brand.logo` is set, keeps the existing text-badge fallback otherwise.
- `app/prodotto/[slug]/page.tsx`: inserts `<BrandSection product={product} />` between the gallery/info grid and `<ProductTabs>`.

## Out of Scope

- No real discount data source — the ~204 "offer" products are synthetic, per the explicit exception above; nothing beyond that percentage/range is implied to be real.
- "Guida ai prodotti" links only to real category pages — no new editorial/blog content is written.
- No URL-reflected pagination state (`?page=N`) — matches the existing sort/price-filter behavior, which also doesn't persist to the URL.
- Mega-menu category flyouts stay at 2 levels; no attempt to surface the full 5-level tree in the nav.
- No download/self-hosting of the 23 real brand logo images — hotlinked from `selleriagalazzo.com`, consistent with the product-image approach from the 2026-07-12 spec (already whitelisted in `next.config.mjs`).
