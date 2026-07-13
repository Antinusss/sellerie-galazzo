# Mega Menu, Brands, Breadcrumbs & Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the Selleria Galazzo mockup closer to real-competitor feature parity (reference: kramer.it) — a richer Navbar mega menu with category photos, a real-logo brands section, a lightweight product-guide section, an offers section, a brand section on product pages, clickable breadcrumbs, and pagination on long product listings.

**Architecture:** Extends the existing static-data architecture (no new dependencies, no backend). New pure logic lives in `lib/` (tested). `scripts/sync-product-feed.ts` gains a brand-logo lookup table and a synthetic-offers pass, both applied when regenerating `data/*.json`. Three new static routes (`/marche`, `/brand/[slug]`, `/offerte`) reuse a new shared `PaginatedProductGrid` component, which also replaces the unpaginated grid inside the existing `/shop/[[...slug]]` category pages.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Jest + ts-jest (existing). No new dependencies.

## Global Constraints

- Real brand logos: exactly 23 of the 62 real brands get a `logo` URL (sourced from selleriagalazzo.com's own homepage carousel, hotlinked — not downloaded). The other 39 keep the existing styled-text-badge fallback. No placeholder/stock images substituted.
- Mega-menu category flyouts show exactly 2 levels below the top-level branch: column header = level-2 node, links = its level-3 children. Deeper levels are not duplicated in the nav (already reachable via the category page's sidebar tree).
- "Guida ai prodotti" links only to real, verified `/shop/...` category pages — no fabricated article/guide content.
- Pagination: 24 products per page, client-side, no URL page param (matches the existing sort/price-filter behavior, which also isn't URL-persisted). Resets to page 1 whenever the product list passed in changes.
- **Explicit, deliberate exception to the 2026-07-12 spec's "no fabricated prices" rule**: `Number(product.id) % 15 === 0` (≈204 of 3066 products, deterministic) get a synthetic `originalPrice` implying a 10/15/20/25/30% discount (`10 + (Math.floor(Number(id) / 15) % 5) * 5`). This is confined to `lib/offers.ts` and does not touch `lib/feed-transform.ts`.
- Brand pages use the real site's URL pattern: `/brand/<slug>` (seen in the live feed's own links, e.g. `https://selleriagalazzo.com/brand/tommy-hilfiger/`).

---

## File Structure

New:
- `lib/offers.ts` — `applyOfferPricing`, pure, tested.
- `lib/branch-images.ts` — hoisted `BRANCH_IMAGES` constant (was inline in `CategoryGrid.tsx`), now shared with the Navbar mega menu.
- `components/shop/PaginatedProductGrid.tsx` — client component, 24/page grid + Prev/Next + numbered pagination. Replaces the bare grid in `ShopCategoryClient` and is reused by the 3 new pages below.
- `components/product/BrandSection.tsx` — brand logo/name + link to `/brand/[slug]` on the product page; renders nothing when `product.brand === ''`.
- `app/marche/page.tsx` — grid of all 62 brands.
- `app/brand/[slug]/page.tsx` — one brand's products, paginated (62 static pages).
- `app/offerte/page.tsx` — all products with `originalPrice !== null`, paginated.

Modified:
- `lib/types.ts` — `Brand.logo?: string`.
- `lib/category-tree.ts` — adds `findCategoryByPath`.
- `scripts/sync-product-feed.ts` — adds `BRAND_LOGOS` lookup and an `applyOfferPricing` call; regenerates `data/products.json` and `data/brands.json`.
- `components/home/CategoryGrid.tsx` — imports `BRANCH_IMAGES` instead of a local `IMAGES` constant.
- `components/layout/Navbar.tsx` — full mega-menu rewrite (category flyouts with promo image, Marche flyout, Offerte link, Guida ai prodotti flyout).
- `components/home/BrandCarousel.tsx` — renders a real logo `<Image>` when `brand.logo` is set, keeps the text-badge fallback otherwise.
- `components/shop/ShopCategoryClient.tsx` — swaps its inline grid for `PaginatedProductGrid`.
- `components/product/ProductInfo.tsx` — category line becomes clickable breadcrumb links.
- `app/prodotto/[slug]/page.tsx` — inserts `<BrandSection product={product} />`.

---

### Task 1: Library foundations — Brand.logo, findCategoryByPath, applyOfferPricing, hoisted branch images

**Files:**
- Modify: `lib/types.ts`
- Modify: `lib/category-tree.ts`
- Modify: `__tests__/category-tree.test.ts`
- Create: `lib/offers.ts`
- Create: `__tests__/offers.test.ts`
- Create: `lib/branch-images.ts`
- Modify: `components/home/CategoryGrid.tsx`

**Interfaces:**
- Produces: `Brand.logo?: string`; `findCategoryByPath(categories: Category[], path: string[]): Category | undefined`; `applyOfferPricing(products: Product[]): Product[]`; `BRANCH_IMAGES: Record<string, string>` — all consumed by later tasks (2, 4, 5, 9, 10).

- [ ] **Step 1: Add `Brand.logo` to `lib/types.ts`**

In the `Brand` interface, add one field:

```ts
export interface Brand {
  id: string
  name: string
  productCount: number
  logo?: string
}
```

- [ ] **Step 2: Write the failing test for `findCategoryByPath`**

Add to `__tests__/category-tree.test.ts` (the file already has `categories`/`products` fixtures and other `describe` blocks — add this new one and the new import name):

```ts
import {
  findCategoryBySlugPath,
  getChildren,
  getTopLevelCategories,
  productsUnderCategory,
  breadcrumbFor,
  getRelatedProducts,
  findCategoryByPath,
} from '@/lib/category-tree'
```

```ts
describe('findCategoryByPath', () => {
  it('finds a node by its name path (not slug)', () => {
    expect(findCategoryByPath(categories, ['Monta Inglese', 'Cavallo'])?.name).toBe('Cavallo')
  })
  it('returns undefined for an unknown path', () => {
    expect(findCategoryByPath(categories, ['Nope'])).toBeUndefined()
  })
  it('returns undefined for an empty path', () => {
    expect(findCategoryByPath(categories, [])).toBeUndefined()
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm test -- category-tree`
Expected: FAIL with "findCategoryByPath is not a function" (or similar — the export doesn't exist yet)

- [ ] **Step 4: Implement `findCategoryByPath` in `lib/category-tree.ts`**

Add at the end of the file:

```ts
export function findCategoryByPath(categories: Category[], path: string[]): Category | undefined {
  if (path.length === 0) return undefined
  return categories.find(
    c => c.path.length === path.length && c.path.every((seg, i) => seg === path[i])
  )
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `npm test -- category-tree`
Expected: PASS (all category-tree tests green, including the 3 new ones)

- [ ] **Step 6: Write the failing tests for `applyOfferPricing`**

Create `__tests__/offers.test.ts`:

```ts
import { applyOfferPricing } from '@/lib/offers'
import type { Product } from '@/lib/types'

function product(id: string, price: number): Product {
  return {
    id, name: `P${id}`, slug: `p${id}`, price, originalPrice: null,
    category: 'Scuderia', categoryPath: ['Scuderia'], brand: 'X', images: [],
    description: '', specs: '', inStock: true,
  }
}

describe('applyOfferPricing', () => {
  it('leaves a product whose id is not a multiple of 15 untouched', () => {
    const [result] = applyOfferPricing([product('14', 1000)])
    expect(result.originalPrice).toBeNull()
    expect(result.price).toBe(1000)
  })

  it('applies a 15% discount original price for id=15', () => {
    const [result] = applyOfferPricing([product('15', 1000)])
    expect(result.originalPrice).toBe(1176)
  })

  it('applies a 20% discount original price for id=30', () => {
    const [result] = applyOfferPricing([product('30', 1000)])
    expect(result.originalPrice).toBe(1250)
  })

  it('applies a 25% discount original price for id=45', () => {
    const [result] = applyOfferPricing([product('45', 1000)])
    expect(result.originalPrice).toBe(1333)
  })

  it('applies a 30% discount original price for id=60', () => {
    const [result] = applyOfferPricing([product('60', 1000)])
    expect(result.originalPrice).toBe(1429)
  })

  it('cycles back to a 10% discount for id=75', () => {
    const [result] = applyOfferPricing([product('75', 1000)])
    expect(result.originalPrice).toBe(1111)
  })

  it('does not mutate the input array', () => {
    const input = [product('15', 1000)]
    applyOfferPricing(input)
    expect(input[0].originalPrice).toBeNull()
  })
})
```

- [ ] **Step 7: Run to verify it fails**

Run: `npm test -- offers`
Expected: FAIL with "Cannot find module '@/lib/offers'"

- [ ] **Step 8: Implement `lib/offers.ts`**

```ts
import type { Product } from './types'

const OFFER_MODULO = 15
const DISCOUNT_BASE = 10
const DISCOUNT_STEP = 5
const DISCOUNT_BUCKETS = 5

export function applyOfferPricing(products: Product[]): Product[] {
  return products.map(p => {
    const numericId = Number(p.id)
    if (!Number.isFinite(numericId) || numericId % OFFER_MODULO !== 0) return p

    const bucket = Math.floor(numericId / OFFER_MODULO) % DISCOUNT_BUCKETS
    const discountPct = DISCOUNT_BASE + bucket * DISCOUNT_STEP
    const originalPrice = Math.round(p.price / (1 - discountPct / 100))

    return { ...p, originalPrice }
  })
}
```

- [ ] **Step 9: Run to verify it passes**

Run: `npm test -- offers`
Expected: PASS (7/7 tests green)

- [ ] **Step 10: Create `lib/branch-images.ts`**

```ts
export const BRANCH_IMAGES: Record<string, string> = {
  'Monta Inglese': 'https://selleriagalazzo.com/wp-content/uploads/2024/02/monta-inglese-e1781945615752-300x300.jpg',
  'Monta Western': 'https://selleriagalazzo.com/wp-content/uploads/2024/02/monta-western-e1781945825723-300x300.jpg',
  'Scuderia': 'https://selleriagalazzo.com/wp-content/uploads/2024/02/scuderia-2-300x300.jpg',
}
```

- [ ] **Step 11: Update `components/home/CategoryGrid.tsx` to use the hoisted constant**

Remove the local `IMAGES` constant and import the shared one instead. Change:

```ts
import categoriesData from '@/data/categories.json'
import type { Category } from '@/lib/types'
import { getChildren } from '@/lib/category-tree'

const DESCRIPTIONS: Record<string, string> = {
  'Monta Inglese': 'Selle, abbigliamento e accessori per salto ostacoli e dressage',
  'Monta Western': 'Tutto per la monta western: cappelli, stivali, selle e abbigliamento',
  'Scuderia': 'Prodotti per la cura quotidiana del cavallo e della scuderia',
}

const IMAGES: Record<string, string> = {
  'Monta Inglese': 'https://selleriagalazzo.com/wp-content/uploads/2024/02/monta-inglese-e1781945615752-300x300.jpg',
  'Monta Western': 'https://selleriagalazzo.com/wp-content/uploads/2024/02/monta-western-e1781945825723-300x300.jpg',
  'Scuderia': 'https://selleriagalazzo.com/wp-content/uploads/2024/02/scuderia-2-300x300.jpg',
}
```

to:

```ts
import categoriesData from '@/data/categories.json'
import type { Category } from '@/lib/types'
import { getChildren } from '@/lib/category-tree'
import { BRANCH_IMAGES } from '@/lib/branch-images'

const DESCRIPTIONS: Record<string, string> = {
  'Monta Inglese': 'Selle, abbigliamento e accessori per salto ostacoli e dressage',
  'Monta Western': 'Tutto per la monta western: cappelli, stivali, selle e abbigliamento',
  'Scuderia': 'Prodotti per la cura quotidiana del cavallo e della scuderia',
}
```

And change the `<Image src=...>` line from `src={IMAGES[cat.name] ?? cat.image ?? ''}` to `src={BRANCH_IMAGES[cat.name] ?? cat.image ?? ''}`.

- [ ] **Step 12: Run the full suite and typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: All tests PASS, zero TypeScript errors

- [ ] **Step 13: Commit**

```bash
git add lib/types.ts lib/category-tree.ts __tests__/category-tree.test.ts lib/offers.ts __tests__/offers.test.ts lib/branch-images.ts components/home/CategoryGrid.tsx
git commit -m "feat: add Brand.logo, findCategoryByPath, applyOfferPricing, shared branch images"
```

---

### Task 2: Sync script — real brand logos + synthetic offers

**Files:**
- Modify: `scripts/sync-product-feed.ts`
- Modify (regenerated by running the script): `data/products.json`, `data/brands.json`

**Interfaces:**
- Consumes: `applyOfferPricing` from `lib/offers.ts` (Task 1)
- Produces: `data/brands.json` entries gain `logo` for 23 brands; `data/products.json` entries gain `originalPrice` for ~204 products — consumed by Tasks 4, 5, 6, 7, 8, 9.

- [ ] **Step 1: Add the `BRAND_LOGOS` lookup and wire in `applyOfferPricing`**

In `scripts/sync-product-feed.ts`, add the import and the constant, and use both. The full updated file:

```ts
import { writeFileSync, mkdirSync } from 'node:fs'
import { XMLParser } from 'fast-xml-parser'
import {
  parsePriceToCents,
  splitDescriptionAndSpecs,
  slugFromLink,
  parseCategoryPath,
  dedupeSlugs,
} from '../lib/feed-transform'
import { applyOfferPricing } from '../lib/offers'
import { slugify } from '../lib/utils'
import type { Product, Category, Brand } from '../lib/types'

const FEED_URL = 'https://selleriagalazzo.com/wp-content/uploads/woo-product-feed-pro/xml/fRYAYy1zVWYyPvFfJ7Sgior0vSkVdGfF.xml'
const LOGO_URL = 'https://selleriagalazzo.com/wp-content/uploads/2024/02/logo-selleria-galazzo-200-b.png'

// Real brand logos, sourced from selleriagalazzo.com's own homepage "I Brand
// selezionati per voi" carousel. Only these 23 of the 62 real brands have a
// logo asset there; the rest fall back to a styled text badge in the UI.
const BRAND_LOGOS: Record<string, string> = {
  'Equestro': 'https://selleriagalazzo.com/wp-content/uploads/2024/03/Equestro-150x150.jpg',
  'Acavallo': 'https://selleriagalazzo.com/wp-content/uploads/2024/03/acavallo-150x150.png',
  'Franceschini': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Franceschini-150x150.png',
  'Acme': 'https://selleriagalazzo.com/wp-content/uploads/2024/03/Acme-150x150.png',
  'Effol': 'https://selleriagalazzo.com/wp-content/uploads/2024/03/Effol-150x150.jpeg',
  'Sergio Grasso': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Sergio-Grasso-150x150.png',
  'LeMieux': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/LeMieux-150x150.png',
  'Tommy Hilfiger': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Tommy-Hilfiger-150x150.png',
  "Pool's": 'https://selleriagalazzo.com/wp-content/uploads/2024/04/pool-s-150x150.png',
  'Farnam': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Farnam-150x150.png',
  'Kask': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Kask-150x150.png',
  'Fiebing’s': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Fiebing-s-150x150.png',
  'Hawtorne': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Hawtorne-150x150.png',
  'MASC': 'https://selleriagalazzo.com/wp-content/uploads/2024/07/logo-masc-3-1-1.jpeg',
  'Absorbine': 'https://selleriagalazzo.com/wp-content/uploads/2024/03/Absorbine-150x150.png',
  'Flicka': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Flicka-150x150.png',
  'Lami-Cell': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Lami-Cell-150x150.png',
  'Lakota': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Lakota-150x150.png',
  'McBRYAN': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/McBRYAN-150x150.png',
  'Schutz Brothers': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Schutz-Brothers-150x150.png',
  'Berlin Custom Leather Ltd': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Berlin-Custom-Leather-Ltd-150x150.png',
  'Burioni': 'https://selleriagalazzo.com/wp-content/uploads/2026/06/square-image-150x150.jpg',
  'Amahorse': 'https://selleriagalazzo.com/wp-content/uploads/2026/06/square-image-3-150x150.webp',
}

interface FeedItem {
  'g:id': number | string
  'g:title': string
  'g:description'?: string
  'g:link': string
  'g:image_link': string
  'g:price': string
  'g:availability': string
  'g:product_type': string
  'g:brand'?: string
}

async function main() {
  console.log('Fetching feed...')
  const xml = await (await fetch(FEED_URL)).text()

  const parser = new XMLParser({ ignoreAttributes: true, trimValues: true })
  const parsed = parser.parse(xml)
  const items: FeedItem[] = parsed.rss.channel.item

  const rawProducts: Product[] = items.map(item => {
    const { description, specs } = splitDescriptionAndSpecs(String(item['g:description'] ?? ''))
    const categoryPath = parseCategoryPath(item['g:product_type'])
    return {
      id: String(item['g:id']),
      name: item['g:title'],
      slug: slugFromLink(item['g:link']),
      price: parsePriceToCents(item['g:price']),
      originalPrice: null,
      category: categoryPath[0] ?? '',
      categoryPath,
      brand: item['g:brand'] ?? '',
      images: [item['g:image_link']],
      description,
      specs,
      inStock: item['g:availability'] === 'in_stock',
    }
  })

  const products = applyOfferPricing(dedupeSlugs(rawProducts))

  const nodePaths = new Map<string, string[]>()
  for (const p of products) {
    for (let i = 1; i <= p.categoryPath.length; i++) {
      const path = p.categoryPath.slice(0, i)
      nodePaths.set(path.join(' > '), path)
    }
  }

  const categories: Category[] = [...nodePaths.values()].map(path => ({
    path,
    slug: path.map(slugify),
    name: path[path.length - 1],
    depth: path.length,
    productCount: products.filter(
      p => p.categoryPath.length >= path.length && path.every((seg, i) => p.categoryPath[i] === seg)
    ).length,
  }))

  for (const top of categories.filter(c => c.depth === 1)) {
    const rep = products.find(p => p.categoryPath[0] === top.name && p.images[0])
    if (rep) top.image = rep.images[0]
  }

  const brandCounts = new Map<string, number>()
  for (const p of products) {
    if (!p.brand) continue
    brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1)
  }
  const brands: Brand[] = [...brandCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, productCount]) => {
      const logo = BRAND_LOGOS[name]
      return logo ? { id: slugify(name), name, productCount, logo } : { id: slugify(name), name, productCount }
    })

  mkdirSync('data', { recursive: true })
  writeFileSync('data/products.json', JSON.stringify(products, null, 2))
  writeFileSync('data/categories.json', JSON.stringify(categories, null, 2))
  writeFileSync('data/brands.json', JSON.stringify(brands, null, 2))
  console.log(`Wrote ${products.length} products, ${categories.length} categories, ${brands.length} brands.`)

  console.log('Downloading logo...')
  const logoBuf = Buffer.from(await (await fetch(LOGO_URL)).arrayBuffer())
  mkdirSync('public', { recursive: true })
  writeFileSync('public/logo-selleria-galazzo.png', logoBuf)
  writeFileSync('app/icon.png', logoBuf)
  console.log('Done.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 2: Run the sync script**

Run: `npm run sync-feed`
Expected: `Wrote 3066 products, 123 categories, 62 brands.` then `Done.`

- [ ] **Step 3: Verify the offers and logos landed correctly**

```bash
node -e "const p=require('./data/products.json'); const withOffer=p.filter(x=>x.originalPrice!==null); console.log('offers:', withOffer.length, 'of', p.length); console.log(withOffer.slice(0,3).map(x=>({id:x.id, price:x.price, originalPrice:x.originalPrice})))"
node -e "const b=require('./data/brands.json'); const withLogo=b.filter(x=>x.logo); console.log('brands with logo:', withLogo.length, 'of', b.length); console.log(withLogo.map(x=>x.name))"
```

Expected: offers count is roughly 200 (3066/15, some fractional rounding), each shown product has `originalPrice > price`; brands-with-logo count is exactly `23`, names match the 23 in `BRAND_LOGOS`.

- [ ] **Step 4: Run the full suite and typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: All tests PASS, zero TypeScript errors (note: `components/layout/Navbar.tsx` and other files not yet touched by this plan may still reference the old, smaller data shape correctly since `Brand`/`Product` only gained optional fields — no breakage expected)

- [ ] **Step 5: Commit**

```bash
git add scripts/sync-product-feed.ts data/products.json data/brands.json
git commit -m "feat: sync real brand logos and synthetic offer pricing from the live feed"
```

---

### Task 3: Paginated product grid, wired into category pages

**Files:**
- Create: `components/shop/PaginatedProductGrid.tsx`
- Modify: `components/shop/ShopCategoryClient.tsx`

**Interfaces:**
- Consumes: `ProductCard` (existing), `Product` from `lib/types`
- Produces: `PaginatedProductGrid` with props `{ products: Product[] }` — consumed by Tasks 7 (`/brand/[slug]`) and 8 (`/offerte`)

- [ ] **Step 1: Create `components/shop/PaginatedProductGrid.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'
import ProductCard from '@/components/shop/ProductCard'
import type { Product } from '@/lib/types'

const PAGE_SIZE = 24

interface PaginatedProductGridProps {
  products: Product[]
}

export default function PaginatedProductGrid({ products }: PaginatedProductGridProps) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [products])

  if (products.length === 0) return null

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * PAGE_SIZE
  const pageItems = products.slice(start, start + PAGE_SIZE)

  const pageNumbers: (number | 'ellipsis')[] = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const nums = new Set<number>([1, 2, totalPages - 1, totalPages, currentPage - 1, currentPage, currentPage + 1])
    const sorted = [...nums].filter(n => n >= 1 && n <= totalPages).sort((a, b) => a - b)
    const result: (number | 'ellipsis')[] = []
    let prev = 0
    for (const n of sorted) {
      if (prev && n - prev > 1) result.push('ellipsis')
      result.push(n)
      prev = n
    }
    return result
  })()

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {pageItems.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-full text-sm font-semibold border-2 border-gray-200 disabled:opacity-40 hover:border-red hover:text-red transition-colors"
          >
            ← Precedente
          </button>
          {pageNumbers.map((n, i) =>
            n === 'ellipsis' ? (
              <span key={`e${i}`} className="px-2 text-gray-400">…</span>
            ) : (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${
                  n === currentPage ? 'bg-red text-white' : 'hover:bg-gray-light'
                }`}
              >
                {n}
              </button>
            )
          )}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-full text-sm font-semibold border-2 border-gray-200 disabled:opacity-40 hover:border-red hover:text-red transition-colors"
          >
            Successiva →
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Wire it into `components/shop/ShopCategoryClient.tsx`**

Replace the import and the grid rendering. Change:

```tsx
import ProductCard from '@/components/shop/ProductCard'
import FilterSidebar from '@/components/shop/FilterSidebar'
import SortDropdown from '@/components/shop/SortDropdown'
```

to:

```tsx
import PaginatedProductGrid from '@/components/shop/PaginatedProductGrid'
import FilterSidebar from '@/components/shop/FilterSidebar'
import SortDropdown from '@/components/shop/SortDropdown'
```

And replace:

```tsx
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
```

with:

```tsx
          <PaginatedProductGrid products={filtered} />
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 4: Verify with the dev server**

Run: `npm run dev` (in background), then check a category with more than 24 products shows pagination controls:

```bash
curl -s http://localhost:3000/shop/monta-inglese | grep -o "Successiva" | head -1
```

Expected: prints `Successiva` (Monta Inglese has 2334 products, far more than one page). Stop the dev server after checking.

- [ ] **Step 5: Commit**

```bash
git add components/shop/PaginatedProductGrid.tsx components/shop/ShopCategoryClient.tsx
git commit -m "feat: paginate category product listings (24/page)"
```

---

### Task 4: Navbar mega menu — category photos, Marche, Offerte, Guida ai prodotti

**Files:**
- Modify: `components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: `getChildren` from `lib/category-tree` (existing), `BRANCH_IMAGES` from `lib/branch-images` (Task 1), `data/brands.json` with `logo` populated (Task 2)

- [ ] **Step 1: Rewrite `components/layout/Navbar.tsx`**

```tsx
'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Search, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import categoriesData from '@/data/categories.json'
import brandsData from '@/data/brands.json'
import type { Category, Brand } from '@/lib/types'
import { getChildren } from '@/lib/category-tree'
import { BRANCH_IMAGES } from '@/lib/branch-images'

const SearchOverlay = dynamic(() => import('./SearchOverlay'), { ssr: false })

const categories = categoriesData as Category[]
const brands = brandsData as Brand[]
const topLevel = getChildren(categories, undefined)
const topBrands = [...brands].sort((a, b) => b.productCount - a.productCount).slice(0, 12)

const GUIDE_LINKS = [
  { label: 'Cura del cavallo', href: '/shop/scuderia/cura-del-cavallo' },
  { label: 'Cura del cuoio', href: '/shop/scuderia/cura-del-cuoio' },
  { label: 'Attrezzatura da scuderia', href: '/shop/scuderia/attrezzatura-da-scuderia' },
  { label: 'Selle e accessori (Inglese)', href: '/shop/monta-inglese/cavallo/selle-e-accessori' },
  { label: 'Coperte', href: '/shop/monta-inglese/cavallo/coperte' },
  { label: 'Protezioni', href: '/shop/monta-inglese/cavallo/protezioni' },
  { label: 'Selle e accessori (Western)', href: '/shop/monta-western/cavallo/selle-e-accessori' },
  { label: 'Briglie e accessori', href: '/shop/monta-inglese/cavallo/briglie-e-accessori' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { totalItems } = useCartStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-8 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex-shrink-0 relative h-10 w-[93px]">
            <Image src="/logo-selleria-galazzo.png" alt="Selleria Galazzo" fill className="object-contain object-left" priority />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {topLevel.map(cat => (
              <div key={cat.slug.join('/')} className="group relative">
                <Link
                  href={`/shop/${cat.slug.join('/')}`}
                  className="text-sm font-medium text-black hover:text-red transition-colors py-6 inline-block"
                >
                  {cat.name}
                </Link>
                <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:flex bg-white shadow-lg rounded-xl p-6 gap-8 z-50 w-max max-w-3xl">
                  <div className="flex gap-8">
                    {getChildren(categories, cat).map(mid => (
                      <div key={mid.slug.join('/')} className="min-w-[160px]">
                        <Link
                          href={`/shop/${mid.slug.join('/')}`}
                          className="block text-xs font-bold uppercase tracking-wide text-black hover:text-red transition-colors mb-3"
                        >
                          {mid.name}
                        </Link>
                        <div className="flex flex-col gap-2">
                          {getChildren(categories, mid).map(leaf => (
                            <Link
                              key={leaf.slug.join('/')}
                              href={`/shop/${leaf.slug.join('/')}`}
                              className="text-sm text-gray-600 hover:text-red transition-colors"
                            >
                              {leaf.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/shop/${cat.slug.join('/')}`}
                    className="relative w-48 shrink-0 rounded-xl overflow-hidden group/promo"
                  >
                    <Image
                      src={BRANCH_IMAGES[cat.name] ?? cat.image ?? ''}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover/promo:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-black text-lg">{cat.name}</p>
                      <p className="text-white/80 text-xs font-semibold mt-1">Scopri tutto →</p>
                    </div>
                  </Link>
                </div>
              </div>
            ))}

            <div className="group relative">
              <Link href="/marche" className="text-sm font-medium text-black hover:text-red transition-colors py-6 inline-block">
                Marche
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:block bg-white shadow-lg rounded-xl p-6 z-50 w-[420px]">
                <div className="grid grid-cols-4 gap-4">
                  {topBrands.map(brand => (
                    <Link
                      key={brand.id}
                      href={`/brand/${brand.id}`}
                      className="flex flex-col items-center gap-2 text-center group/brand"
                    >
                      {brand.logo ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-light">
                          <Image src={brand.logo} alt={brand.name} fill className="object-contain p-1" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-light flex items-center justify-center text-xs font-black text-gray-400">
                          {brand.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs text-black group-hover/brand:text-red transition-colors leading-tight">{brand.name}</span>
                    </Link>
                  ))}
                </div>
                <Link href="/marche" className="block text-center text-sm font-semibold text-red mt-4 hover:text-red-dark">
                  Vedi tutti i marchi →
                </Link>
              </div>
            </div>

            <Link href="/offerte" className="text-sm font-medium text-red hover:text-red-dark transition-colors py-6 inline-block">
              Offerte
            </Link>

            <div className="group relative">
              <span className="text-sm font-medium text-black py-6 inline-block cursor-default">
                Guida ai prodotti
              </span>
              <div className="absolute right-0 top-full hidden group-hover:block bg-white shadow-lg rounded-xl p-6 z-50 w-64">
                <div className="flex flex-col gap-2">
                  {GUIDE_LINKS.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-black hover:text-red transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:text-red transition-colors" onClick={() => setSearchOpen(true)}>
              <Search size={20} />
            </button>
            <button className="p-2 hover:text-red transition-colors">
              <Heart size={20} />
            </button>
            <Link href="/cart" className="relative p-2 hover:text-red transition-colors">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            {topLevel.map(cat => (
              <Link
                key={cat.slug.join('/')}
                href={`/shop/${cat.slug.join('/')}`}
                className="block py-3 text-sm font-medium text-black hover:text-red"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <Link href="/marche" className="block py-3 text-sm font-medium text-black hover:text-red" onClick={() => setMobileOpen(false)}>
              Marche
            </Link>
            <Link href="/offerte" className="block py-3 text-sm font-medium text-red hover:text-red-dark" onClick={() => setMobileOpen(false)}>
              Offerte
            </Link>
          </div>
        )}
      </div>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </nav>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 3: Verify with the dev server**

Run: `npm run dev` (in background), then curl the homepage and grep for the new nav items:

```bash
curl -s http://localhost:3000/ | grep -o "Marche\|Offerte\|Guida ai prodotti" | sort -u
```

Expected: all three strings present. Stop the dev server after checking. (A full hover-flyout visual check happens in Task 11's browser pass.)

- [ ] **Step 4: Commit**

```bash
git add components/layout/Navbar.tsx
git commit -m "feat: mega menu with category photos, Marche, Offerte, Guida ai prodotti"
```

---

### Task 5: Real brand logos in the homepage BrandCarousel

**Files:**
- Modify: `components/home/BrandCarousel.tsx`

**Interfaces:**
- Consumes: `data/brands.json` with `logo` populated (Task 2)

- [ ] **Step 1: Rewrite `components/home/BrandCarousel.tsx`**

```tsx
import Image from 'next/image'
import brandsData from '@/data/brands.json'
import type { Brand } from '@/lib/types'

const brands = brandsData as Brand[]

export default function BrandCarousel() {
  const doubled = [...brands, ...brands]
  return (
    <section className="py-16 bg-gray-light overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">I brand selezionati per voi</h3>
      </div>
      <div className="flex whitespace-nowrap marquee">
        {doubled.map((brand, i) => (
          <div key={i} className="inline-flex items-center justify-center mx-12 opacity-50 hover:opacity-100 transition-opacity">
            {brand.logo ? (
              <div className="relative w-24 h-12">
                <Image src={brand.logo} alt={brand.name} fill className="object-contain" />
              </div>
            ) : (
              <span className="text-xl font-black text-black">{brand.name}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 3: Commit**

```bash
git add components/home/BrandCarousel.tsx
git commit -m "feat: real brand logos in the homepage carousel"
```

---

### Task 6: `/marche` page — all brands grid

**Files:**
- Create: `app/marche/page.tsx`

**Interfaces:**
- Consumes: `data/brands.json` with `logo` populated (Task 2)

- [ ] **Step 1: Create `app/marche/page.tsx`**

```tsx
import Link from 'next/link'
import Image from 'next/image'
import brandsData from '@/data/brands.json'
import type { Brand } from '@/lib/types'

export const metadata = { title: 'Tutti i marchi — Selleria Galazzo' }

export default function MarchePage() {
  const brands = [...(brandsData as Brand[])].sort((a, b) => b.productCount - a.productCount)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-black mb-8">
        Tutti i <em className="text-red">marchi</em>
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {brands.map(brand => (
          <Link
            key={brand.id}
            href={`/brand/${brand.id}`}
            className="flex flex-col items-center gap-3 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center"
          >
            {brand.logo ? (
              <div className="relative w-16 h-16">
                <Image src={brand.logo} alt={brand.name} fill className="object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-light flex items-center justify-center text-lg font-black text-gray-400">
                {brand.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-semibold text-black">{brand.name}</span>
            <span className="text-xs text-gray-400">{brand.productCount} prodotti</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 3: Verify with the dev server**

Run: `npm run dev` (in background), then:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/marche
```

Expected: `200`. Stop the dev server after checking.

- [ ] **Step 4: Commit**

```bash
git add app/marche/page.tsx
git commit -m "feat: add /marche page listing all brands"
```

---

### Task 7: `/brand/[slug]` page — one brand's products, paginated

**Files:**
- Create: `app/brand/[slug]/page.tsx`

**Interfaces:**
- Consumes: `PaginatedProductGrid` (Task 3), `data/brands.json` with `logo` (Task 2)

- [ ] **Step 1: Create `app/brand/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import allProducts from '@/data/products.json'
import allBrands from '@/data/brands.json'
import type { Product, Brand } from '@/lib/types'
import PaginatedProductGrid from '@/components/shop/PaginatedProductGrid'

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return (allBrands as Brand[]).map(b => ({ slug: b.id }))
}

export default function BrandPage({ params }: Props) {
  const brand = (allBrands as Brand[]).find(b => b.id === params.slug)
  if (!brand) notFound()

  const products = (allProducts as Product[]).filter(p => p.brand === brand.name)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        {brand.logo && (
          <div className="relative w-16 h-16 shrink-0">
            <Image src={brand.logo} alt={brand.name} fill className="object-contain" />
          </div>
        )}
        <div>
          <h1 className="text-4xl font-black">{brand.name}</h1>
          <p className="text-sm text-gray-400">{products.length} prodotti</p>
        </div>
      </div>
      <PaginatedProductGrid products={products} />
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 3: Verify with the dev server**

Run: `npm run dev` (in background), then:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/brand/equestro
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/brand/tommy-hilfiger
```

Expected: `200` for both. Stop the dev server after checking.

- [ ] **Step 4: Commit**

```bash
git add app/brand
git commit -m "feat: add /brand/[slug] page, one per brand"
```

---

### Task 8: `/offerte` page

**Files:**
- Create: `app/offerte/page.tsx`

**Interfaces:**
- Consumes: `PaginatedProductGrid` (Task 3), `data/products.json` with `originalPrice` populated (Task 2)

- [ ] **Step 1: Create `app/offerte/page.tsx`**

```tsx
import allProducts from '@/data/products.json'
import type { Product } from '@/lib/types'
import PaginatedProductGrid from '@/components/shop/PaginatedProductGrid'

export const metadata = { title: 'Offerte — Selleria Galazzo' }

export default function OffertePage() {
  const products = (allProducts as Product[]).filter(p => p.originalPrice !== null)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-black mb-2">
        Le nostre <em className="text-red">offerte</em>
      </h1>
      <p className="text-sm text-gray-400 mb-8">{products.length} prodotti in offerta</p>
      <PaginatedProductGrid products={products} />
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 3: Verify with the dev server**

Run: `npm run dev` (in background), then:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/offerte
curl -s http://localhost:3000/offerte | grep -o "prodotti in offerta" | head -1
```

Expected: `200`, and `prodotti in offerta` found in the page. Stop the dev server after checking.

- [ ] **Step 4: Commit**

```bash
git add app/offerte/page.tsx
git commit -m "feat: add /offerte page listing discounted products"
```

---

### Task 9: Brand section on the product page

**Files:**
- Create: `components/product/BrandSection.tsx`
- Modify: `app/prodotto/[slug]/page.tsx`

**Interfaces:**
- Consumes: `data/brands.json` with `logo`/`id` (Task 2)

- [ ] **Step 1: Create `components/product/BrandSection.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import allBrands from '@/data/brands.json'
import type { Brand, Product } from '@/lib/types'

interface BrandSectionProps { product: Product }

export default function BrandSection({ product }: BrandSectionProps) {
  if (!product.brand) return null
  const brand = (allBrands as Brand[]).find(b => b.name === product.brand)
  if (!brand) return null

  return (
    <section className="mt-12 bg-gray-light rounded-2xl p-6 flex items-center gap-4">
      {brand.logo ? (
        <div className="relative w-14 h-14 shrink-0 bg-white rounded-full overflow-hidden">
          <Image src={brand.logo} alt={brand.name} fill className="object-contain p-2" />
        </div>
      ) : (
        <div className="w-14 h-14 shrink-0 rounded-full bg-white flex items-center justify-center text-sm font-black text-gray-400">
          {brand.name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Venduto da</p>
        <p className="font-black text-lg">{brand.name}</p>
      </div>
      <Link href={`/brand/${brand.id}`} className="text-sm font-semibold text-red hover:text-red-dark whitespace-nowrap">
        Vedi tutti i prodotti →
      </Link>
    </section>
  )
}
```

- [ ] **Step 2: Wire it into `app/prodotto/[slug]/page.tsx`**

Change:

```tsx
import ProductGallery from '@/components/product/ProductGallery'
import ProductInfo from '@/components/product/ProductInfo'
import ProductTabs from '@/components/product/ProductTabs'
import RelatedProducts from '@/components/product/RelatedProducts'
import NewsletterSection from '@/components/product/NewsletterSection'
```

to:

```tsx
import ProductGallery from '@/components/product/ProductGallery'
import ProductInfo from '@/components/product/ProductInfo'
import ProductTabs from '@/components/product/ProductTabs'
import RelatedProducts from '@/components/product/RelatedProducts'
import NewsletterSection from '@/components/product/NewsletterSection'
import BrandSection from '@/components/product/BrandSection'
```

And change:

```tsx
      <ProductTabs description={product.description} specs={product.specs} />
      <RelatedProducts product={product} />
      <NewsletterSection />
```

to:

```tsx
      <BrandSection product={product} />
      <ProductTabs description={product.description} specs={product.specs} />
      <RelatedProducts product={product} />
      <NewsletterSection />
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 4: Verify with the dev server**

Run: `npm run dev` (in background), then:

```bash
curl -s http://localhost:3000/prodotto/acavallo-sapone-per-il-cuoio-alla-mandorla-500ml-glicerina | grep -o "Venduto da"
```

Expected: prints `Venduto da` (this product has brand "Acavallo", which has a real logo from Task 2). Stop the dev server after checking.

- [ ] **Step 5: Commit**

```bash
git add components/product/BrandSection.tsx app/prodotto/\[slug\]/page.tsx
git commit -m "feat: brand section on product pages"
```

---

### Task 10: Clickable breadcrumbs on the product page

**Files:**
- Modify: `components/product/ProductInfo.tsx`

**Interfaces:**
- Consumes: `findCategoryByPath` from `lib/category-tree` (Task 1)

- [ ] **Step 1: Update `components/product/ProductInfo.tsx`**

Add imports and a `categories`/`breadcrumbSlug` lookup, and replace the plain category `<p>` with a linked breadcrumb `<nav>`. Change:

```tsx
'use client'
import { useState } from 'react'
import { Heart, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface ProductInfoProps { product: Product }

export default function ProductInfo({ product }: ProductInfoProps) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCartStore()
```

to:

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Heart, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { findCategoryByPath } from '@/lib/category-tree'
import categoriesData from '@/data/categories.json'
import type { Product, Category } from '@/lib/types'

const categories = categoriesData as Category[]

interface ProductInfoProps { product: Product }

export default function ProductInfo({ product }: ProductInfoProps) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCartStore()
  const breadcrumbSlug = findCategoryByPath(categories, product.categoryPath)?.slug ?? []
```

Then change:

```tsx
        <p className="text-sand font-bold uppercase text-xs tracking-widest mb-2">{product.categoryPath.join(' / ')}</p>
```

to:

```tsx
        <nav className="text-sand font-bold uppercase text-xs tracking-widest mb-2 flex flex-wrap items-center gap-1">
          {product.categoryPath.map((segment, i) => (
            <span key={segment} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-300">/</span>}
              {breadcrumbSlug.length > 0 ? (
                <Link href={`/shop/${breadcrumbSlug.slice(0, i + 1).join('/')}`} className="hover:text-red transition-colors">
                  {segment}
                </Link>
              ) : (
                <span>{segment}</span>
              )}
            </span>
          ))}
        </nav>
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 3: Verify with the dev server**

Run: `npm run dev` (in background), then:

```bash
curl -s http://localhost:3000/prodotto/acavallo-sapone-per-il-cuoio-alla-mandorla-500ml-glicerina | grep -o 'href="/shop/scuderia[^"]*"' | sort -u
```

Expected: at least `href="/shop/scuderia"` and `href="/shop/scuderia/cura-del-cuoio"` both present (this product's category is Scuderia > Cura del cuoio). Stop the dev server after checking.

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: PASS (no test covers `ProductInfo` directly, but this confirms no regressions elsewhere)

- [ ] **Step 5: Commit**

```bash
git add components/product/ProductInfo.tsx
git commit -m "feat: clickable category breadcrumbs on product pages"
```

---

### Task 11: Full build + test + manual verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS, all suites green (category-tree, offers, feed-transform, store, utils)

- [ ] **Step 2: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: zero TypeScript errors; build succeeds. Page count grows by 62 (`/brand/[slug]`) + 2 (`/marche`, `/offerte`) over the previous ~3199, so expect roughly 3263 static pages generated.

- [ ] **Step 3: Manual smoke test with the production build**

Run: `npm run start` (in background), then:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/marche
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/brand/equestro
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/offerte
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/shop/monta-inglese
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/prodotto/acavallo-sapone-per-il-cuoio-alla-mandorla-500ml-glicerina
```

Expected: `200` for every route. Stop the server after checking.

- [ ] **Step 4: Browser check of the golden path**

Using the `run` skill or a browser tool, confirm interactively: hovering each of the 3 category nav items shows the multi-column flyout with the promo photo on the right; hovering "Marche" shows the logo grid; "Offerte" is a plain red-tinted link; hovering "Guida ai prodotti" shows the 8 links; `/marche` renders all 62 brand tiles; a brand page (`/brand/tommy-hilfiger`) lists only that brand's products with working pagination; `/offerte` shows only discounted products with a strike-through original price; a product page shows the new "Venduto da" brand block and the category breadcrumb is clickable at every level; a long category (`/shop/monta-inglese`) shows page-number controls and clicking page 2 changes the grid.

- [ ] **Step 5: Final commit (if any fixups were needed)**

```bash
git add -A
git commit -m "fix: address issues found during full verification"
```

(Skip this step if Steps 1-4 all passed cleanly with no changes needed.)
