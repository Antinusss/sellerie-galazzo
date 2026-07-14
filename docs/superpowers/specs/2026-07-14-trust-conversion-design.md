# Trust & Conversion — Design Spec

**Date:** 2026-07-14
**Status:** Approved

## Context

Client feedback (2026-07-14) flagged several conversion/trust gaps and asked
for priority to go to this cluster first (of a larger list — mega-menu/brand
pages/search/pagination items were already shipped in a prior round and are
excluded here; product-variant unification and content/SEO/hero work are
separate, later specs):

1. Adding to cart gives no visible feedback — no slide-out cart panel.
2. Payment methods are card-only; client wants PayPal, Klarna (Buy Now Pay
   Later), and bank transfer as visible options.
3. No customer reviews anywhere — client explicitly approved fabricated
   reviews for trust signal ("anche finte").
4. Search should be an always-visible header bar (fashion/resale sites
   convention), not icon-triggered.

## Decisions

1. **Cart drawer**: `lib/store.ts` gains `isCartOpen`/`openCart`/`closeCart`.
   Adding a product (from `ProductCard` or `ProductInfo`) opens the drawer.
   The Navbar cart icon becomes a drawer trigger instead of a `/cart` link
   (the drawer itself links to the full cart page and to checkout). The
   persist middleware gets a `partialize` so only `items` survives a reload
   — `isCartOpen` must not persist (a refreshed page shouldn't reopen the
   drawer).
2. **Payment methods**: checkout step 3 gets a method selector (Carta /
   PayPal / Klarna / Bonifico bancario) styled like the existing step-2
   shipping-method cards. Selecting a non-card method swaps the card fields
   for short explanatory mockup copy (no real payment integration — this is
   a static mockup, confirmed in the original project scope). A small
   Klarna BNPL line ("Paga in 3 rate da €X senza interessi") is added under
   the price on the product page — text-only badge in Klarna's signature
   pink, no Klarna logo asset (avoids using their trademarked mark without
   authorization).
3. **Fake reviews**: new `lib/reviews.ts`, deterministic (same technique as
   `lib/offers.ts` — hashed from `product.id`, not `Math.random()`, so
   output is stable across builds). Produces an aggregate rating (4.2–5.0,
   skewed positive like real ecommerce averages) + review count (3–120) +
   up to 5 sample written reviews (fake author, relative date, rating, one
   of 15 generic-but-plausible Italian review texts). Isolated from
   `lib/feed-transform.ts`, same reasoning as the offers exception. Shown:
   compact stars+count on `ProductCard`, stars+count under the title on
   `ProductInfo`, a new "Recensioni (N)" 4th tab on `ProductTabs` with the
   sample reviews, and one aggregate stat ("4.8★ recensioni verificate")
   added to the Hero's existing stats row (10k+/200+/40+).
4. **Always-visible search**: Navbar becomes two rows on desktop — row 1:
   logo, an inline search input (center, live dropdown of results below it
   while typing), wishlist/cart icons; row 2: the existing category mega
   menu (Monta Inglese/Monta Western/Scuderia/Marche/Offerte/Guida ai
   prodotti), unchanged from the prior round. Mobile keeps the icon-
   triggered full-screen `SearchOverlay` (no room for an inline bar at
   mobile widths). The live-filter logic is extracted into a shared pure
   `lib/search.ts` (`searchProducts`) so the new desktop bar and the
   existing mobile overlay don't duplicate it.

## Data Layer

- `lib/store.ts`: `isCartOpen: boolean`, `openCart(): void`, `closeCart(): void`
  added to the store; `persist(..., { name: '...', partialize: (s) => ({ items: s.items }) })`.
- `lib/reviews.ts` (new): `getReviewSummary(productId: string): { rating: number; count: number; reviews: Review[] }`
  where `Review = { author: string; rating: number; date: string; text: string }`.
  Pure, deterministic, tested.
- `lib/search.ts` (new): `searchProducts(products: Product[], query: string, limit?: number): Product[]`
  — extracted from the current inline logic in `SearchOverlay.tsx`. Pure, tested.

## Component Changes

- `components/cart/CartDrawer.tsx` (new): always mounted in `Navbar`,
  visibility/slide driven by `isCartOpen` via a CSS transform transition
  (not conditional mount, so the slide animates). Header with item count +
  close button, scrollable item list (image, name, price, qty stepper,
  remove — reusing `useCartStore`'s existing actions), sticky footer with
  subtotal + "Vai al carrello" + "Vai al checkout" buttons, empty state.
- `components/layout/Navbar.tsx`: two-row desktop layout (search row +
  category-menu row); cart icon becomes `onClick={openCart}` instead of a
  `Link`; renders `<CartDrawer />` unconditionally (like it already does
  for the lazy `SearchOverlay`).
- `components/layout/HeaderSearchBar.tsx` (new): desktop-only inline input
  + anchored results dropdown, built on `searchProducts`; closes on
  outside click (document listener) or Escape.
- `components/layout/SearchOverlay.tsx`: unchanged behavior, refactored to
  call the shared `searchProducts` instead of its own inline filter;
  becomes mobile-only in `Navbar`.
- `components/shop/ProductCard.tsx`: compact star-rating + review count
  under the product name; `addItem` call also calls `openCart`.
- `components/product/ProductInfo.tsx`: star-rating + review count under
  the title; Klarna BNPL line under the price; `addItem` also calls `openCart`.
- `components/product/ProductTabs.tsx`: 4th tab "Recensioni (N)" rendering
  the sample reviews (author, stars, relative date, text) or an empty-state
  message if a product has 0 reviews (deterministic generator always
  produces ≥3, so this is a defensive fallback, not an expected case).
- `components/home/HeroSection.tsx`: adds a 4th stat tile to the existing
  three (10k+ Cavalieri / 200+ Brand / 40+ Anni) for the aggregate review
  trust signal.
- `app/checkout/page.tsx`: step 3 gains the payment-method selector; the
  existing card-field block only renders when "Carta" is selected.

## Out of Scope

- No real payment processing for any method (card included — this was
  already true before this spec; PayPal/Klarna/Bonifico are equally mock).
- No Klarna logo/brand asset — text-only badge in their signature color.
- Reviews are entirely fabricated placeholder content, clearly a mockup
  concern, not tied to any real product feedback.
- Mobile search stays icon+overlay — no inline bar at mobile widths.
- Product-variant unification (parent/color-variant pages), secondary
  pages (Contattaci/Spedizioni/Resi/FAQ/Guida taglie), SEO meta
  descriptions, and the horze.it-style hero redesign are separate specs,
  not covered here.
