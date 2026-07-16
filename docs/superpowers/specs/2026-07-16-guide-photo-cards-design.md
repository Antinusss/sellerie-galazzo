# Photo-Card Guide Links + Home Shortcut Section — Design Spec

**Date:** 2026-07-16
**Status:** Approved

## Context

Two related requests:

1. `/guida-ai-prodotti` currently renders its 8 links as plain white
   text-only cards (`app/guida-ai-prodotti/page.tsx`) — the client wants a
   background photo representing each category, matching the visual
   language already used by the home page's `CategoryGrid` (photo +
   dark gradient + white title).
2. The home page should also surface these same category shortcuts
   directly, "per facilitare la navigazione" — today the home page only
   has `CategoryGrid`, which covers the 3 broad top-level branches
   (Monta Inglese / Monta Western / Scuderia), not the 8 more specific
   sub-categories `GUIDE_LINKS` already curates.

Verified against the real catalog (`data/categories.json` +
`data/products.json`) that every one of the 8 `GUIDE_LINKS` categories
resolves to a real category node with real matching products, each with
a real image — no placeholder or fabricated asset needed:

| Category | Products | Has image |
|---|---|---|
| scuderia/cura-del-cavallo | 244 | yes |
| scuderia/cura-del-cuoio | 20 | yes |
| scuderia/attrezzatura-da-scuderia | 45 | yes |
| monta-inglese/cavallo/selle-e-accessori | 37 | yes |
| monta-inglese/cavallo/coperte | 135 | yes |
| monta-inglese/cavallo/protezioni | 175 | yes |
| monta-western/cavallo/selle-e-accessori | 41 | yes |
| monta-inglese/cavallo/briglie-e-accessori | 82 | yes |

## Decisions

- `lib/guide-links.ts` gains a computed `image` field per entry: for each
  link's href, resolve the category via `findCategoryBySlugPath`
  (existing, `lib/category-tree.ts`), find its products via
  `productsUnderCategory` (existing), and take the first product with a
  non-empty `images[0]`. This computation runs once at module load
  (import time), over the already-imported `data/categories.json` and
  `data/products.json` — no new data files, no runtime cost per render.
  This is real product photography, not a fabricated asset, consistent
  with how `BRANCH_IMAGES`/`lib/branch-images.ts` sources its 3 top-level
  category photos (those are hardcoded real URLs from the client's site;
  this is the same idea applied dynamically since there's no hand-picked
  photo per sub-category).
- `app/guida-ai-prodotti/page.tsx`: cards restyled to the same
  photo-card visual pattern `CategoryGrid.tsx` already uses — `aspect`
  box, `Image fill object-cover`, `bg-gradient-to-t from-black/70
  via-black/20 to-transparent` overlay, white title pinned to the
  bottom-left via `absolute bottom-0 left-0 right-0 p-4`. Grid breakpoints
  unchanged (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4`).
- `components/home/GuideLinksSection.tsx` (new): the same 8 photo cards,
  in a 4-wide grid on desktop, with a heading ("Trova quello che cerchi")
  and a "Vedi tutte →" link to `/guida-ai-prodotti`, following the same
  section-header pattern as `BestsellersSection`/`NewArrivalsCarousel`
  (heading left, link right).
- `app/page.tsx`: new section inserted between `CategoryGrid` and
  `NewArrivalsCarousel` — broad disciplines first, then specific
  shortcuts, then products, mirroring how a shopper would actually
  narrow down.
- The Navbar's "Guida ai prodotti" hover flyout (plain text list) is
  unchanged — it stays a compact list, not photo cards; only the
  dedicated page and the new home section get the photo treatment.

## Data Layer

- `lib/guide-links.ts`: `GuideLink` interface gains `image: string`.
  `GUIDE_LINKS: GuideLink[]` is still the single exported array,
  computed once from a private raw-links list + the image lookup.

## Component/Route Changes

- `lib/guide-links.ts`: adds the image-resolution logic and the `image`
  field.
- `app/guida-ai-prodotti/page.tsx`: card markup replaced with the
  photo-card pattern.
- `components/home/GuideLinksSection.tsx` (new).
- `app/page.tsx`: wires in the new section.

## Out of Scope

- Changing the Navbar flyout's text-list presentation.
- Any new photography/asset sourcing — uses existing real product
  images only.
- Changing which 8 categories `GUIDE_LINKS` curates.
