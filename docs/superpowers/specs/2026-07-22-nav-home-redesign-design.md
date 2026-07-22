# Nav & Home Redesign — Design Spec

**Round 1 of 3** (this session's batch: Nav & Home redesign, Category page SEO description, Cart & Checkout trust redesign — each its own spec/plan/build cycle).

## Goal

Restyle the mega menu, home hero, and home category section to reference layouts the client provided (e-commerce hardware/wood retailer screenshots), while staying on the existing 3-branch category structure (Monta Inglese / Monta Western / Scuderia) and reusing already-established real/synthetic data patterns (bestseller ranking by fake review count, GUIDE_LINKS curated categories with real product photos).

## Decisions from Q&A

- Mega menu keeps 3 separate top-nav triggers (Monta Inglese / Monta Western / Scuderia) — not a single "Tutti i prodotti" button. Each panel is restyled to 3 columns.
- Featured products in the menu panel and in the new home category rows use the existing bestseller-by-review-count ranking (see `components/home/BestsellersSection.tsx` pattern), scoped to the relevant category branch — real product data, synthetic-but-already-approved ordering.
- The menu panel's sidebar is interactive: hovering a mid-level category updates the center pane's leaf-category cards (not everything shown at once as today).
- Hero switches from the current full-screen background photo (added 2026-07-16) to a contained banner + sidebar layout. This explicitly reverses that prior decision per client's new reference.
- Home category section replaces `CategoryGrid.tsx` entirely (not additive).
- Home category rows and hero's quick-category cards both reuse `GUIDE_LINKS` (8 curated categories, already has real product photos via `lib/guide-links.ts`) rather than inventing new curation.

## 1. Mega Menu (`components/layout/Navbar.tsx`)

Each of the 3 top-level hover panels (currently a single flex row of mid-category columns + one promo image) becomes 3 columns:

- **Left sidebar** (~200px): list of mid-level categories under that branch (`getChildren(categories, cat)` filtered to those with leaf children, same as today). Hovering an item marks it active (bg tint, red text) and sets it as the selected mid-category for this panel (local `useState` inside the panel, reset on panel close). First item is selected by default when the panel opens.
- **Center pane**: leaf categories of the selected mid-category, rendered as simple text tiles (bg-gray-light rounded-xl cards, name + chevron icon) — no photos, since only the 3 top-level categories have an `image` field in `data/categories.json`; leaf categories don't, and computing per-leaf representative images at hover-time is unnecessary complexity for a menu panel (out of scope; the existing `GUIDE_LINKS`/guide-photo-cards pattern already covers curated categories with photos elsewhere).
- **Right column** ("IN EVIDENZA", ~256px): top 4 bestseller products for that branch, ranked by `getReviewSummary(id).count` descending (same helper `BestsellersSection.tsx` uses), filtered via `productsUnderCategory(products, cat)`. Small product tiles: image, name, price — link to `/prodotto/[slug]`. This column does not change when the sidebar selection changes (branch-wide, not sub-category-scoped) — keeps the panel simple and avoids a second reactive computation per hover.

No new data files. Reuses `getChildren`, `productsUnderCategory`, `getReviewSummary`, all already imported/available.

## 2. Hero (`components/home/HeroSection.tsx`)

Full rewrite, drops the full-screen background image entirely.

- **Left**: rounded-2xl banner (~2/3 width on desktop, stacks full-width on mobile) using the existing Unsplash cavaliere photo, `object-cover`, dark gradient overlay bottom-left for text legibility. Copy shifts from brand-story to product-conversion: headline becomes something like "Tutto il necessario per il tuo cavallo" (short, no "Dal 1985" positioning line), single CTA "Scopri lo Shop" → `/shop`. Drops the second "Le Novità" CTA and the 4-stat brand-trust row (10k+ cavalieri, 200+ brand, etc.) — those numbers were brand storytelling, out of scope for this conversion-first redesign.
- **Right**: column of 3 stacked category quick-link cards, `GUIDE_LINKS.slice(0, 3)` — each a small card (real product photo, category label, "Acquistare →" link) linking to `href`.
- **Below** (full width): 4-item trust strip, same treatment as the reference: "Spedizione gratuita sopra €80" (real, `FREE_SHIPPING_THRESHOLD`), "Pagamento sicuro SSL", "Reso entro 14 giorni" (real, matches `/resi-e-rimborsi`), "Paga in 3 rate con Klarna" (matches existing Klarna BNPL badge on PDP). Icons: lucide generic (Truck/Lock/RotateCcw/CreditCard or similar — no brand marks needed here beyond the Klarna text label).

## 3. Home category section (replaces `components/home/CategoryGrid.tsx`)

New component (suggest `components/home/CategoryShowcase.tsx`, swapped into `app/page.tsx` in place of `CategoryGrid`). Renders `GUIDE_LINKS.slice(0, 4)` as stacked rows, each row:

- **Promo tile** (fixed width, e.g. 280px): the category's real photo (already on `GuideLink.image`), category label overlaid, "Vai ai prodotti →" CTA, links to `href`.
- **Product strip** (remaining width, horizontal scroll on overflow, `overflow-x-auto`): top 6 bestseller products for that category (same ranking helper as the menu panel, scoped via `findCategoryBySlugPath` + `productsUnderCategory` on the `href`'s slug path), rendered with the existing `ProductCard` component (already has photo/name/price/discount badge/add-to-cart) so no new product-tile UI is needed — just laid out in a horizontally-scrolling flex row instead of the grid `ProductCard` normally sits in.

## Shared helper

Both the mega menu's "in evidenza" column and the home category rows need "top N bestseller products in category X." Extract one small helper, e.g. `topBestsellers(products: Product[], category: Category | undefined, limit: number): Product[]` in `lib/reviews.ts` (co-located with `getReviewSummary`, the ranking source), used by both `Navbar.tsx` and the new `CategoryShowcase.tsx`. Avoids duplicating the `productsUnderCategory(...).sort(...).slice(...)` snippet in two files.

## Out of scope

- Per-leaf category images in the mega menu center pane (see note above).
- Any change to `/shop` category listing pages, `/marche`, `/offerte` — this round only touches the Navbar panel and the home page.
- Category page SEO descriptions and cart/checkout trust redesign — separate rounds (2 and 3).
