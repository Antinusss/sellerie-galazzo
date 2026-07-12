# Real Catalog Import — Design Spec

**Date:** 2026-07-12
**Status:** Approved

## Context

The current mockup ships 24 hand-written fake products, flat 4-value category
enum, and Unsplash/Picsum placeholder images/logos. The client wants the
mockup rebuilt on the real Selleria Galazzo product catalog and information
architecture, pulled from their live Google Shopping XML feed, plus the real
brand logo.

Source feed:
`https://selleriagalazzo.com/wp-content/uploads/woo-product-feed-pro/xml/fRYAYy1zVWYyPvFfJ7Sgior0vSkVdGfF.xml`

Logo: `https://selleriagalazzo.com/wp-content/uploads/2024/02/logo-selleria-galazzo-200-b.png`

Feed analysis (2026-07-12 snapshot):
- 3066 `<item>` entries, Google Shopping RSS format (`g:` namespace)
- Fields used: `g:id`, `g:title`, `g:description` (CDATA, HTML with an
  embedded "Specifiche tecniche" `<ul>`), `g:link` (real `/prodotto/<slug>/`
  URL), `g:image_link` (single image, no gallery, no
  `additional_image_link`), `g:price` (`EUR15.99` format), `g:availability`,
  `g:product_type` (breadcrumb-style category path, `&gt;`-separated),
  `g:brand`
- Category tree: 3 top-level branches (Monta Inglese, Monta Western,
  Scuderia), max depth 6 segments including "Home", 124 total tree nodes,
  105 leaf paths
- 62 distinct brands (Equestro, Umbria Equitazione, Supreme, Tommy Hilfiger,
  Pool's, Acavallo, etc.) — feed has no brand logo URLs
- No sale/original price data, no product variants/item groups (size/color
  already baked into individual titles, e.g. "GIALLO PONY 2")

## Decisions

1. **Full catalog**: import all 3066 products, not a curated subset.
2. **Full category hierarchy**: rebuild the real multi-level tree (not
   flattened), with nested static routes per node.
3. **Images**: hotlink original `selleriagalazzo.com` URLs directly (no
   local download). `next.config.mjs` gets `selleriagalazzo.com` added to
   `images.remotePatterns`.
4. **Logo**: real PNG replaces the styled text logo everywhere (Navbar,
   Footer, favicon).

## Data Pipeline

New repeatable script: `scripts/sync-product-feed.mjs`

- Fetches the feed URL, parses the `g:`-namespaced RSS/XML
- Writes three files under `data/`:
  - `data/products.json` — one entry per feed item:
    - `id`: feed `g:id`
    - `name`: `g:title`
    - `slug`: last path segment of `g:link` (matches real site URLs, e.g.
      `acavallo-sapone-per-il-cuoio-alla-mandorla-500ml-glicerina`)
    - `price`: parsed from `g:price` (`"EUR15.99"` → `1599`, cents, keeps
      existing `Product.price` contract)
    - `originalPrice`: always `null` (feed has no discount data — no
      fabricated sale prices)
    - `categoryPath`: array of path segments from `g:product_type`,
      HTML-unescaped, "Home" dropped (e.g.
      `["Monta Inglese", "Cavaliere", "Donna", "Abbigliamento", "Pantaloni"]`)
    - `category`: `categoryPath[0]` (top-level, kept for simple filtering/back-compat)
    - `brand`: `g:brand`
    - `images`: `[g:image_link]` (single-element array — feed has one image
      per product)
    - `description`: text portion of the CDATA before the "Specifiche
      tecniche" marker, HTML stripped to plain paragraphs
    - `specs`: list items from the "Specifiche tecniche" `<ul>`, joined
      `" | "` (keeps existing `Product.specs: string` contract)
    - `inStock`: `g:availability === 'in_stock'`
  - `data/categories.json` — full tree, one entry per node (124 total):
    - `path`: array of segments from root to this node
    - `slug`: array of slugified segments (URL-safe, one per path level)
    - `name`: display name (last segment)
    - `depth`: path length
    - `productCount`: number of products whose `categoryPath` starts with
      this node's `path`
  - `data/brands.json` — 62 entries: `{ id, name, productCount }` (no
    `logo` field — feed has none, dropping the fake Picsum logos)
- Script is re-run manually when the client's catalog changes; not called
  at build/runtime. Run once now to populate `data/`.

## Routing

- **Category pages**: `/shop/[...slug]` catch-all, one static page per tree
  node (124 pages via `generateStaticParams`). Renders breadcrumb, child
  subcategory links, and the product grid for all products under that path
  prefix. Filtering/sorting (existing `FilterSidebar`/`SortDropdown`)
  operates within the current node's product set.
- **Product detail**: moves from `/shop/[slug]` to `/prodotto/[slug]`,
  matching the real site's URL structure. 3066 static pages via
  `generateStaticParams`.
- Total statically generated pages: ~3190. Build time will grow
  accordingly (expect a few minutes on Vercel) — acceptable for this
  mockup's scale.

## Component Changes

- `lib/types.ts`: `Product.category` becomes the top-level string (kept),
  new `Product.categoryPath: string[]`. New `Category` shape gains `path`,
  `slug: string[]`, `depth`, `productCount`; drops the single flat `slug`
  string in favor of the segment array. `Brand` drops `logo`.
- `FilterSidebar`: rebuilt as an expandable tree control reflecting
  `data/categories.json`, replacing the flat checkbox list.
- `Navbar`: mega-menu shows the 3 top branches plus their immediate
  children (level 2) as links into `/shop/...` — not the full 124-node
  tree, which would be unusable as a dropdown. Deeper drill-down happens
  via the category page's own subcategory links / sidebar tree.
- `CategoryGrid` (home): 3 cards (Monta Inglese, Monta Western, Scuderia),
  each image swapped from Unsplash to a real representative product image
  from the feed. The old standalone "Cavaliere" top-level category is
  dropped (it's a level-2 node under each Monta branch in the real
  taxonomy, not a top branch).
- `ProductGallery`: renders the single real image (no more fake
  multi-image placeholder arrays).
- `BrandCarousel`: renders brand name text badges instead of logo images
  (no real logos available in the feed).
- `NewArrivalsCarousel` / any other component sampling "featured" products:
  pulls from the real 3066-item `data/products.json` instead of the old
  24-item mock array.

## Branding

- Download logo PNG into `public/` (e.g. `public/logo-selleria-galazzo.png`).
- Replace the styled text logo (`components/layout/Navbar.tsx`,
  `components/layout/Footer.tsx`) with `<Image>` using the real PNG.
- Replace `app/favicon.ico` source with a generated favicon from the same
  logo.

## Testing

- Existing Jest/RTL suite (`__tests__/store.test.ts`,
  `__tests__/utils.test.ts`) updated only where it references old mock
  shape/category values.
- Manual verification: `npm run build` succeeds and generates the expected
  ~3190 static pages; spot-check a category page at each depth, a product
  detail page, cart/checkout flow still works end-to-end with real product
  data.

## Out of Scope

- No fabricated sale prices, variants, or additional product images beyond
  what the feed provides.
- No live/runtime fetching of the feed — data is a committed static
  snapshot, refreshed by manually re-running the sync script.
- No download/self-hosting of product images — hotlinked from
  `selleriagalazzo.com`.
