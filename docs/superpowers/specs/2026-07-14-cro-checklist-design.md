# CRO Checklist — Applicable Items — Design Spec

**Date:** 2026-07-14
**Status:** Approved

## Context

Client provided a generic 305-item eCommerce CRO checklist (Shopify/Klaviyo-
oriented agency template, `Sito Ecommerce - Lista Ottimizzazioni CRO.xlsx`)
asking to "apply everything that can be implemented."

Full triage against this static Next.js mockup (no backend, no auth, no
analytics, no email platform, single market/currency):

**Not applicable (majority of the sheet):**
- Bonus Tools sheet (30+ third-party SaaS pitches: Trainual, Hyros,
  Dropified, NordVPN, etc.) — irrelevant to a demo site.
- 80+ SOP items (Klaviyo welcome/abandoned-cart/win-back flows, email
  marketing, A/B testing via Optimizely/Convert) — require a real email
  platform and live traffic, neither of which exist here.
- Heatmaps — explicitly declined by the client in the sheet's own note
  ("Al momento che le campagne sono spente non attiverei..").
- Live chat / phone support, login + password recovery, multi-language /
  multi-currency — no backend or account system exists or is planned.
- Real trust badges (Norton Secured), press/PR logos, social follower
  counts, "customer photos with faces" — would require assets or
  accreditations we don't have; fabricating them is a false claim, not a
  mockup convenience.
- Fabricated urgency counters ("17,885 shipped this month", "7 people
  viewing now") — a dark pattern, and beyond the deterministic-but-honest
  exception already granted for reviews/offers.
- Product comparison tool, bundle/quantity pricing — overlaps the already
  deferred variant-unification backlog item, not tackled here.
- Landing Page sheet — this site has no distinct landing-page template
  separate from category/product pages.

**Already satisfied by existing code** (verified by reading current
components, not assumed): sticky navbar, logo→home, clickable breadcrumbs,
search with icon + enter-to-search, cart widget top-right, free-shipping
threshold messaging (`CartSummary`, `AnnouncementBar`, `TrustSection`),
multiple payment methods, checkout step indicator, de-facto guest checkout
(no account system to bypass), footer policy/category links, pagination,
category filters.

**Applicable and not yet built — this spec's scope:**

1. Real wishlist (heart icon is currently decorative).
2. Free-shipping progress message in `CartDrawer` (exists in `CartSummary`,
   missing in the drawer).
3. "Continua lo shopping" link on `/cart` when it has items (only present
   in the empty state today).
4. Branded 404 page with a CTA back to the shop.
5. Cookie consent banner (accept/decline, no real tracking to gate since
   this mockup does none).
6. Checkout input polish: `type="email"`/`type="tel"`, `inputMode="numeric"`
   for CAP, `autoComplete` attributes.
7. "Più venduti" home section, ranked by the existing real review data
   (`lib/reviews.ts`), not fabricated ranking.
8. Footer "Torna su" link.
9. Deterministic "Novità"/"Bestseller" badges on product cards — same
   approved pattern as `lib/offers.ts`/`lib/reviews.ts` (hashed from
   `product.id`, never random, isolated module).
10. Distraction-free checkout layout: hide the full navbar/footer during
    `/checkout` (and `/checkout/success`), replace with a minimal bar
    (logo linking home + "Pagamento sicuro" microcopy).

## Decisions

- **Wishlist**: `lib/wishlist-store.ts`, a second small Zustand store
  (`persist`, localStorage key `selleria-galazzo-wishlist`) holding
  `productIds: string[]` with `toggleWishlist(id)` and `isWishlisted(id)`.
  Heart icon in `Navbar` becomes a link to new `/wishlist` page showing
  count; `ProductCard` and `ProductInfo` get a heart toggle button.
  `/wishlist` page reuses the existing product-grid rendering pattern
  (same as `/offerte`).
- **Badges**: new `lib/badges.ts`, pure function
  `getBadge(productId: string): 'novita' | 'bestseller' | null`,
  deterministic hash (same technique as `lib/offers.ts`): roughly 8% of
  products get "novità", a different ~8% (products whose review count
  from `lib/reviews.ts` exceeds a threshold) get "bestseller" — ties the
  label to the real fabricated-but-consistent review data instead of a
  second unrelated random slice. A product never gets both. Rendered as a
  small pill top-left on `ProductCard`'s image.
- **"Più venduti" home section**: new component
  `components/home/BestsellersSection.tsx`, takes the top N products by
  `getReviewSummary(id).count` (existing function), reuses the existing
  product-card rendering. Placed after `NewArrivalsCarousel`.
- **Checkout distraction-free layout**: `app/layout.tsx` currently renders
  `AnnouncementBar` + `Navbar` + `Footer` unconditionally around
  `children`. Introduce a client component `components/layout/ChromeGate.tsx`
  that reads the current pathname (`usePathname`) and renders the full
  chrome everywhere except `/checkout` and `/checkout/success`, where it
  renders a minimal bar instead (logo linking `/`, lock icon +
  "Pagamento sicuro" text, no nav, no footer). This is a layout-level
  change, so it is scoped as its own task with its own review.
- **404 page**: `app/not-found.tsx`, matches the site's visual language
  (red accent, bold headline), CTA button to `/shop`.
- **Cookie banner**: `components/layout/CookieBanner.tsx`, fixed bottom
  bar, "Accetta" / "Rifiuta" buttons, dismissal stored in `localStorage`
  (`selleria-galazzo-cookie-consent`) so it doesn't reappear — no actual
  cookie/tracking logic behind it since the site sets no tracking cookies.
- **Cart drawer free-shipping message / cart page CTA / checkout input
  attributes / footer back-to-top**: small, self-contained edits to
  existing files, no new modules.

## Data Layer

- `lib/wishlist-store.ts` (new): Zustand store, same `persist` +
  `partialize` pattern as `lib/store.ts`.
- `lib/badges.ts` (new): `getBadge(productId: string, reviewCount: number): 'novita' | 'bestseller' | null`,
  pure, deterministic, tested (same hash technique as `lib/offers.ts`).

## Component/Route Changes

- `components/layout/Navbar.tsx`: heart icon → `Link href="/wishlist"`
  with a count badge from `useWishlistStore`.
- `components/shop/ProductCard.tsx`: wishlist toggle button (heart,
  filled when wishlisted) + badge pill from `getBadge`.
- `components/product/ProductInfo.tsx`: wishlist toggle button near the
  add-to-cart CTA.
- `app/wishlist/page.tsx` (new): lists wishlisted products, empty state
  matching `/cart`'s empty-state pattern.
- `components/cart/CartDrawer.tsx`: free-shipping progress line above the
  subtotal, same threshold/copy as `CartSummary`.
- `app/cart/page.tsx`: "Continua lo shopping" link near the item list
  when `items.length > 0`.
- `app/not-found.tsx` (new).
- `components/layout/CookieBanner.tsx` (new), mounted in `app/layout.tsx`.
- `app/checkout/page.tsx`: add `type`/`inputMode`/`autoComplete` to the
  existing input fields (no new fields).
- `components/home/BestsellersSection.tsx` (new), added to `app/page.tsx`.
- `components/layout/Footer.tsx`: "Torna su" link (`href="#top"` or a
  `scrollTo` handler).
- `components/layout/ChromeGate.tsx` (new); `app/layout.tsx` updated to
  route chrome through it.

## Out of Scope

- Everything in the "Not applicable" list above.
- Product-badge/wishlist data is per-browser (localStorage), not
  server-synced — consistent with the cart's existing behavior.
- No changes to `/shop`, `/prodotto`, `/brand`, `/marche`, `/offerte`
  page structure beyond adding the badge pill and wishlist button to
  product cards.
