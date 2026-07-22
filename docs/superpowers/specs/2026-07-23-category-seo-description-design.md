# Category Page SEO Description — Design Spec

**Round 2 of 3** (this batch: Nav & Home redesign — done, Category page SEO description — this spec, Cart & Checkout trust redesign — next).

## Goal

Add a real, non-fabricated description to every category page (`/shop/[[...slug]]`), both as visible on-page copy and as a `<meta name="description">` tag, to improve SEO and give users landing-page context.

## Decisions from Q&A

- The site has 123 categories (3 top-level branches, ~30 mid-level, ~90 leaf). Writing bespoke prose for each is out of scope — instead, a template generates the description from real per-category facts (`category.name`, `category.productCount`, `category.path`), so every page gets a description with zero invented content.
- Both the visible paragraph and the `<meta name="description">` tag reuse the same generated string — one source of truth per page.
- The description only renders when a `category` is resolved (i.e. not on the unfiltered `/shop` root, which has no single category to describe).

## Template

A new pure function, `categoryDescription(category: Category): string` in `lib/category-description.ts`, with two branches:

- **depth 1 (branch — Monta Inglese / Monta Western / Scuderia):**
  `"Tutto il necessario per {name}: {productCount} prodotti selezionati, spedizione rapida in tutta Italia e reso entro 14 giorni."`
- **depth 2–5 (everything else):**
  `"Scopri i nostri {productCount} prodotti di {name} per {parent}: qualità professionale, spedizione tracciata e reso entro 14 giorni."`
  where `parent = category.path[category.path.length - 2]` (always defined when depth > 1).

No singular/plural handling needed — verified every category has `productCount >= 2` (min 2, max 2334 across the 123 categories in `data/categories.json`). The 14-day return window and tracked shipping are both real, already-published site facts (matches `/resi-e-rimborsi`, `/spedizioni`), not new claims.

## Placement

- **Visible copy:** a `<p>` rendered in `app/shop/[[...slug]]/page.tsx`, directly below the existing `<h1>`/breadcrumb block, above `ShopCategoryClient`.
- **Meta tag:** `app/shop/[[...slug]]/page.tsx` gains a `generateMetadata({ params })` export (the page is a server component already, currently has no metadata export at all) that resolves the same category and returns `{ title, description: categoryDescription(category) }` when a category is found, or a generic fallback (`{ title: 'Shop — Selleria Galazzo' }`, no description) for the root `/shop` path.

## Out of scope

- Bespoke hand-written copy for any category (explicitly rejected in favor of the template, for full 123-page coverage).
- Any change to `/marche`, `/brand/[slug]`, `/offerte`, or product detail pages — this round only touches the category route.
- Truncating the generated string to a strict meta-description character budget (~155 chars) — templated strings stay reasonably short in practice; not worth the added logic for a mockup.
