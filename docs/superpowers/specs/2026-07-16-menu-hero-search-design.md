# Guida ai Prodotti Link + Full-Screen Hero + Search Results Page — Design Spec

**Date:** 2026-07-16
**Status:** Approved

## Context

Three independent UX gaps reported by the client:

1. "Guida ai prodotti" in the Navbar's desktop row is a plain `<span
   className="cursor-default">` (`components/layout/Navbar.tsx:200-203`)
   — unlike the other five menu items (Monta Inglese/Western, Scuderia,
   Marche, Offerte), which are all real `<Link>`s, this one only opens a
   hover flyout and has no destination of its own.
2. The home page hero (`components/home/HeroSection.tsx`) puts its photo
   in the right half of a `lg:grid-cols-2` layout — the client wants a
   true full-screen background photo, referencing horze.it (this exact
   request — "un header con foto full-page" — was already raised in an
   earlier feedback round and explicitly deferred to backlog; this spec
   is that deferred item).
3. `components/layout/HeaderSearchBar.tsx` shows a live dropdown of up to
   8 matches (`lib/search.ts`'s `searchProducts`, plain single-field
   substring match on `product.name`) but has no `<form>`, no Enter-key
   handling, and no click handler on the search icon — there is no way to
   reach a page listing every match. The client also asked for "semantic
   search"; confirmed with the client that true embedding/AI-based
   semantic search is out of reach for a static site with no backend, and
   the agreed realistic substitute is word-based, multi-field matching
   (name + brand + category + description, every query word must appear
   somewhere, in any field/order) rather than a single-field substring
   check.

## Decisions

### 1. "Guida ai prodotti" link

- `components/layout/Navbar.tsx`: the `<span className="... cursor-default">Guida
  ai prodotti</span>` becomes `<Link href="/guida-ai-prodotti">Guida ai
  prodotti</Link>` with the same classes minus `cursor-default`. The
  existing hover flyout (the 8 `GUIDE_LINKS`) is unchanged — clicking the
  label now also navigates, exactly like "Marche" already does (link +
  flyout coexist there today).
- `app/guida-ai-prodotti/page.tsx` (new): a landing page listing the same
  8 `GUIDE_LINKS` as clickable cards, following the exact visual pattern
  `app/marche/page.tsx` already uses for its brand grid (title, `grid`
  of `Link` cards with hover shadow). `GUIDE_LINKS` moves from being a
  Navbar-local constant to an exported constant in `lib/guide-links.ts`
  so both `Navbar.tsx` and the new page import the same array — no
  duplicated data.

### 2. Full-screen hero

- `components/home/HeroSection.tsx` restructured: the photo becomes an
  `absolute inset-0` background layer (`Image fill`) behind the whole
  `<section>`, replacing the current `lg:grid-cols-2` split. A dark
  gradient scrim (`bg-gradient-to-r from-black/70 via-black/40 to-black/10`,
  stronger on the left where the text sits, matching horze.it's
  left-aligned-text-over-photo convention) sits between the photo and the
  text so white text stays legible over any part of the image. Text
  content — eyebrow, headline, subcopy, the two CTA buttons, and the
  four stats — is unchanged in copy and order, just recolored to white
  (`text-white` / lighter tints for secondary text) and no longer boxed
  into a grid column, so it reads as an overlay on the left ~60% of the
  section. Same Unsplash photo already in use (no new asset to source).
  Section height changes from `min-h-[90vh]` with a `500px`/`650px`
  image box to a flat `min-h-[90vh]` (now the section's actual height
  since the image fills it), preserving the current visual scale.

### 3. Search results page + word-based multi-field matching

- `lib/search.ts`: `searchProducts` reworked to split the query into
  lowercase words and require every word to appear as a substring in at
  least one of `product.name`, `product.brand`, `product.category`, or
  `product.description` (checked per word, independently — a word
  matching in `brand` and another word matching in `name` both count).
  The `limit` parameter changes from a hard slice inside the function to
  an optional cap only the dropdown uses; the new search-results page
  calls it uncapped. Existing callers (`HeaderSearchBar`, `SearchOverlay`)
  keep working unchanged since the default limit stays 8.
- `app/cerca/page.tsx` (new): reads `?q=` from the URL
  (`useSearchParams`), runs `searchProducts(products, q)` with no limit,
  renders the result count and query, and reuses the existing
  `PaginatedProductGrid` component for the (potentially large) result
  list — identical pattern to `/offerte`.
- `components/layout/HeaderSearchBar.tsx`: the input's wrapping `<div>`
  becomes a `<form>` with `onSubmit` that calls
  `router.push(\`/cerca?q=${encodeURIComponent(query)}\`)` (and closes the
  live dropdown). The search icon becomes a `<button type="submit">`
  instead of a decorative `<Search>` icon, so both Enter and clicking the
  icon trigger the same navigation. The live dropdown's existing
  behavior (up to 8 inline results while typing) is unchanged.
- `components/layout/SearchOverlay.tsx` (mobile): out of scope for the
  Enter/submit wiring — it already has its own full-screen results
  layout that shows all matches on-screen (not capped in the same way),
  so there is no separate "results page" gap on mobile. It only picks up
  the improved multi-field matching automatically since it calls the
  same `searchProducts`.

## Data Layer

- `lib/search.ts`: `searchProducts(products: Product[], query: string, limit?: number): Product[]`
  — signature unchanged, matching logic reworked internally (word-based,
  multi-field instead of single-field substring). Pure, tested.
- `lib/guide-links.ts` (new): exports `GUIDE_LINKS: { label: string; href: string }[]`
  (the 8 entries currently inline in `Navbar.tsx`), consumed by both
  `Navbar.tsx` and the new `/guida-ai-prodotti` page.

## Component/Route Changes

- `components/layout/Navbar.tsx`: "Guida ai prodotti" span → Link;
  `GUIDE_LINKS` import replaces the local constant.
- `app/guida-ai-prodotti/page.tsx` (new).
- `components/home/HeroSection.tsx`: rewritten for full-screen background
  photo + overlay text, same copy/links/stats.
- `app/cerca/page.tsx` (new).
- `components/layout/HeaderSearchBar.tsx`: `<div>` → `<form>`, decorative
  icon → submit button, `useRouter` added.

## Out of Scope

- True AI/embedding-based semantic search (confirmed with client — no
  backend to run it against).
- Search filters/sorting on the `/cerca` results page beyond what
  `PaginatedProductGrid` already provides (pagination only, same as
  `/offerte`).
- Changing `SearchOverlay.tsx`'s (mobile) own layout — it keeps its
  existing full-screen inline-results behavior, just benefits from the
  improved matching.
- A new hero photo/asset — reuses the existing Unsplash image.
- Any change to the other five Navbar items — they already link
  correctly.
