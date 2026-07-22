# Nav & Home Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the mega menu (3-column interactive panel), rewrite the home hero (product-conversion banner instead of full-screen brand photo), and replace the home category section (promo tile + real bestseller product rows instead of a static 3-card grid).

**Architecture:** One new pure-logic helper (`topBestsellers`) shared by the menu panel and the new home section; the menu panel gets local interactive state for its sidebar selection; the hero and category section are each a full-file rewrite of an existing home component. `CategoryGrid.tsx` and `GuideLinksSection.tsx` are removed (superseded by the new category section) along with their now-orphaned `lib/branch-images.ts` dependency.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, lucide-react 1.21.0, Jest.

## Global Constraints

- lucide-react 1.21.0 has no brand icons. This round's new icons — `ChevronRight`, `Truck`, `Lock`, `RotateCcw`, `CreditCard` — are all confirmed present in the installed version (verified via `node -e "require('lucide-react')..."`).
- This repo has no component-level (`.test.tsx`) tests — only pure-logic `.test.ts` files under `__tests__/`. New pure functions get unit tests; UI component changes are verified via `tsc --noEmit` + `npm run build` + manual browser check only, matching every prior round.
- `FREE_SHIPPING_THRESHOLD` (`lib/utils.ts`) is `8000` (cents) = real €80 free-shipping threshold. Existing pages (`/spedizioni`, `/faq`, `/resi-e-rimborsi`) all hardcode the copy as plain "€80", not via `formatPrice()` (which would render "€80,00"). New copy in this plan follows the same convention.
- Bestseller ranking reuses the existing synthetic-but-approved pattern: real products, ordered by `getReviewSummary(id).count` (fake review count, deterministic hash — same exception already used by `components/home/BestsellersSection.tsx` and `lib/badges.ts`). Never invent new fake data fields.
- `GUIDE_LINKS` (`lib/guide-links.ts`) already provides 8 curated categories with real product photos (first in-stock product's image per category, computed at module load). Reused as-is, not modified.

---

### Task 1: `topBestsellers` ranking helper

**Files:**
- Modify: `lib/reviews.ts`
- Test: `__tests__/reviews.test.ts`

**Interfaces:**
- Produces: `topBestsellers(products: Product[], category: Category | undefined, limit: number): Product[]` from `@/lib/reviews` — consumed by Task 2 (mega menu) and Task 4 (home category section).

- [ ] **Step 1: Write the failing tests**

Add to the bottom of `__tests__/reviews.test.ts`:

```ts
import { getReviewSummary, topBestsellers } from '@/lib/reviews'
import type { Category, Product } from '@/lib/types'

const categories: Category[] = [
  { path: ['Monta Inglese'], slug: ['monta-inglese'], name: 'Monta Inglese', depth: 1, productCount: 3 },
]

function product(id: string, categoryPath: string[]): Product {
  return {
    id, name: `P${id}`, slug: `p${id}`, price: 100, originalPrice: null,
    category: categoryPath[0], categoryPath, brand: 'X', images: [],
    description: '', specs: '', inStock: true,
  }
}

const products: Product[] = [
  product('1', ['Monta Inglese']),
  product('2', ['Monta Inglese']),
  product('3', ['Monta Inglese']),
  product('4', ['Scuderia']),
]

describe('topBestsellers', () => {
  it('ranks products by review count descending', () => {
    expect(topBestsellers(products, undefined, 4).map(p => p.id)).toEqual(['4', '3', '2', '1'])
  })

  it('filters to the given category before ranking', () => {
    expect(topBestsellers(products, categories[0], 4).map(p => p.id)).toEqual(['3', '2', '1'])
  })

  it('respects the limit', () => {
    expect(topBestsellers(products, undefined, 2)).toHaveLength(2)
  })
})
```

Note: `getReviewSummary` is already imported at the top of `__tests__/reviews.test.ts` — add `topBestsellers` to that same existing import line instead of duplicating the import statement. Same for `Category`/`Product` — check whether `__tests__/reviews.test.ts` already imports from `@/lib/types` before adding a second import line.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- reviews.test.ts`
Expected: FAIL — `topBestsellers is not a function` (or similar — the export doesn't exist yet).

- [ ] **Step 3: Implement `topBestsellers`**

In `lib/reviews.ts`, add these two lines to the top of the file (above the existing `export interface Review` line):

```ts
import type { Category, Product } from './types'
import { productsUnderCategory } from './category-tree'
```

Then add this function at the end of the file, after `getReviewSummary`:

```ts
export function topBestsellers(products: Product[], category: Category | undefined, limit: number): Product[] {
  return productsUnderCategory(products, category)
    .slice()
    .sort((a, b) => getReviewSummary(b.id).count - getReviewSummary(a.id).count)
    .slice(0, limit)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- reviews.test.ts`
Expected: PASS, all tests including the 3 new ones.

- [ ] **Step 5: Run the full suite and typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: all existing tests still pass (no regressions from the new import in `lib/reviews.ts`), no type errors.

- [ ] **Step 6: Commit**

```bash
git add lib/reviews.ts __tests__/reviews.test.ts
git commit -m "feat: add topBestsellers ranking helper"
```

---

### Task 2: Mega menu 3-column interactive panel

**Files:**
- Modify: `components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: `topBestsellers(products, category, limit)` from Task 1.

- [ ] **Step 1: Update imports and add local state**

Replace this import block (lines 1–16 of `components/layout/Navbar.tsx`):

```tsx
'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Search, User, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'
import { useAuthStore } from '@/lib/auth-store'
import categoriesData from '@/data/categories.json'
import brandsData from '@/data/brands.json'
import type { Category, Brand } from '@/lib/types'
import { getChildren } from '@/lib/category-tree'
import { BRANCH_IMAGES } from '@/lib/branch-images'
import { GUIDE_LINKS } from '@/lib/guide-links'
import HeaderSearchBar from './HeaderSearchBar'
```

with:

```tsx
'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Search, User, Menu, X, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'
import { useAuthStore } from '@/lib/auth-store'
import categoriesData from '@/data/categories.json'
import brandsData from '@/data/brands.json'
import productsData from '@/data/products.json'
import type { Category, Brand, Product } from '@/lib/types'
import { getChildren } from '@/lib/category-tree'
import { topBestsellers } from '@/lib/reviews'
import { formatPrice } from '@/lib/utils'
import { GUIDE_LINKS } from '@/lib/guide-links'
import HeaderSearchBar from './HeaderSearchBar'
```

Replace this line (originally line 21):

```tsx
const brands = brandsData as Brand[]
```

with:

```tsx
const brands = brandsData as Brand[]
const products = productsData as Product[]
```

Replace this state block (originally lines 26–29):

```tsx
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
```

with:

```tsx
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [activeMid, setActiveMid] = useState<Record<string, string>>({})
```

- [ ] **Step 2: Reset the sidebar selection when a top-nav category opens**

Replace this block (originally lines 86–100):

```tsx
        <div className="hidden md:flex items-center justify-between h-12 border-t border-gray-100 relative">
          {topLevel.map(cat => (
            <div
              key={cat.slug.join('/')}
              onMouseEnter={() => setOpenCategory(cat.name)}
              onMouseLeave={() => setOpenCategory(null)}
            >
              <Link
                href={`/shop/${cat.slug.join('/')}`}
                className="text-sm font-medium text-black hover:text-red transition-colors h-12 inline-flex items-center"
              >
                {cat.name}
              </Link>
            </div>
          ))}
```

with:

```tsx
        <div className="hidden md:flex items-center justify-between h-12 border-t border-gray-100 relative">
          {topLevel.map(cat => (
            <div
              key={cat.slug.join('/')}
              onMouseEnter={() => { setOpenCategory(cat.name); setActiveMid({}) }}
              onMouseLeave={() => setOpenCategory(null)}
            >
              <Link
                href={`/shop/${cat.slug.join('/')}`}
                className="text-sm font-medium text-black hover:text-red transition-colors h-12 inline-flex items-center"
              >
                {cat.name}
              </Link>
            </div>
          ))}
```

- [ ] **Step 3: Replace the panel with the 3-column layout**

Replace this entire block (originally lines 102–153):

```tsx
          {topLevel.map(cat => (
            <div
              key={`panel-${cat.slug.join('/')}`}
              onMouseEnter={() => setOpenCategory(cat.name)}
              onMouseLeave={() => setOpenCategory(null)}
              className={`absolute left-0 right-0 top-full bg-white shadow-lg border-t border-gray-100 rounded-b-xl z-50 ${
                openCategory === cat.name ? 'block' : 'hidden'
              }`}
            >
              <div className="flex gap-10 p-8">
                <div className="flex-1 flex gap-16">
                  {getChildren(categories, cat).filter(mid => getChildren(categories, mid).length > 0).map(mid => (
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
                  className="relative w-64 shrink-0 rounded-xl overflow-hidden group/promo"
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
```

with:

```tsx
          {topLevel.map(cat => {
            const midCats = getChildren(categories, cat).filter(mid => getChildren(categories, mid).length > 0)
            const activeMidSlug = activeMid[cat.name] ?? midCats[0]?.slug.join('/')
            const activeMidCat = midCats.find(m => m.slug.join('/') === activeMidSlug)
            const featured = topBestsellers(products, cat, 4)

            return (
              <div
                key={`panel-${cat.slug.join('/')}`}
                onMouseEnter={() => setOpenCategory(cat.name)}
                onMouseLeave={() => setOpenCategory(null)}
                className={`absolute left-0 right-0 top-full bg-white shadow-lg border-t border-gray-100 rounded-b-xl z-50 ${
                  openCategory === cat.name ? 'block' : 'hidden'
                }`}
              >
                <div className="flex gap-8 p-8">
                  <div className="w-48 shrink-0 flex flex-col gap-1">
                    {midCats.map(mid => (
                      <button
                        key={mid.slug.join('/')}
                        onMouseEnter={() => setActiveMid(m => ({ ...m, [cat.name]: mid.slug.join('/') }))}
                        className={`text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          activeMidSlug === mid.slug.join('/') ? 'bg-red/10 text-red' : 'text-black hover:bg-gray-light'
                        }`}
                      >
                        {mid.name}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-3 content-start">
                    {activeMidCat && getChildren(categories, activeMidCat).map(leaf => (
                      <Link
                        key={leaf.slug.join('/')}
                        href={`/shop/${leaf.slug.join('/')}`}
                        className="flex items-center justify-between gap-2 bg-gray-light rounded-xl px-4 py-3 text-sm font-semibold text-black hover:text-red hover:bg-sand/10 transition-colors"
                      >
                        {leaf.name}
                        <ChevronRight size={14} className="shrink-0 opacity-50" />
                      </Link>
                    ))}
                  </div>

                  <div className="w-64 shrink-0">
                    <p className="text-xs font-black uppercase tracking-wide text-gray-400 mb-3">In evidenza</p>
                    <div className="flex flex-col gap-3">
                      {featured.map(p => (
                        <Link key={p.id} href={`/prodotto/${p.slug}`} className="flex gap-3 items-center group/prod">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-light shrink-0">
                            <Image src={p.images[0] ?? ''} alt={p.name} fill className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-black line-clamp-2 group-hover/prod:text-red transition-colors">{p.name}</p>
                            <p className="text-xs font-black text-red mt-0.5">{formatPrice(p.price)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
```

- [ ] **Step 4: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors (in particular, no "unused import" errors for `BRANCH_IMAGES` — it's fully removed from this file).

Run: `npm run build`
Expected: build succeeds.

Run: `npm test`
Expected: all tests still pass (this file has no dedicated test suite; this just guards against an unrelated regression).

- [ ] **Step 5: Commit**

```bash
git add components/layout/Navbar.tsx
git commit -m "feat: redesign mega menu panel to 3-column interactive layout"
```

---

### Task 3: Hero rewrite

**Files:**
- Modify: `components/home/HeroSection.tsx`

**Interfaces:**
- Consumes: `GUIDE_LINKS` from `@/lib/guide-links` (existing, `{ label: string, href: string, image: string }[]`).

- [ ] **Step 1: Replace the full file**

Replace the entire contents of `components/home/HeroSection.tsx` with:

```tsx
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Truck, Lock, RotateCcw, CreditCard } from 'lucide-react'
import { GUIDE_LINKS } from '@/lib/guide-links'

const TRUST_POINTS = [
  { icon: Truck, title: 'Spedizione gratuita sopra €80', desc: 'Corriere tracciato in tutta Italia' },
  { icon: Lock, title: 'Pagamento sicuro SSL', desc: 'I tuoi dati sono sempre protetti' },
  { icon: RotateCcw, title: 'Reso entro 14 giorni', desc: 'Cambio idea? Nessun problema' },
  { icon: CreditCard, title: 'Paga in 3 rate con Klarna', desc: 'Senza interessi, zero pensieri' },
]

export default function HeroSection() {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-2 relative rounded-2xl overflow-hidden min-h-[420px] flex items-end"
          >
            <Image
              src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1600&q=85"
              alt="Cavaliere in azione"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative p-8 sm:p-10 max-w-md">
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
                Tutto il necessario per il tuo <em className="text-red">cavallo</em>
              </h1>
              <Link
                href="/shop"
                className="inline-block bg-red text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-red-dark transition-colors"
              >
                Scopri lo Shop
              </Link>
            </div>
          </motion.div>

          <div className="flex flex-col gap-4">
            {GUIDE_LINKS.slice(0, 3).map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="group flex items-center gap-4 bg-gray-light rounded-2xl p-4 hover:bg-sand/10 transition-colors"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    <Image src={link.image} alt={link.label} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm text-black">{link.label}</p>
                    <p className="text-xs text-red font-semibold mt-1">Acquistare →</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {TRUST_POINTS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 bg-gray-light rounded-xl p-4">
              <Icon className="text-red shrink-0 mt-0.5" size={22} />
              <div>
                <p className="font-bold text-xs text-black leading-tight">{title}</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/home/HeroSection.tsx
git commit -m "feat: rewrite hero as product-conversion banner (drop full-screen brand photo)"
```

---

### Task 4: Home category section — `CategoryShowcase`, remove `CategoryGrid`/`GuideLinksSection`

**Files:**
- Create: `components/home/CategoryShowcase.tsx`
- Delete: `components/home/CategoryGrid.tsx`
- Delete: `components/home/GuideLinksSection.tsx`
- Delete: `lib/branch-images.ts`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `topBestsellers(products, category, limit)` from Task 1; `GUIDE_LINKS` from `@/lib/guide-links`; `findCategoryBySlugPath` from `@/lib/category-tree`; `ProductCard` from `@/components/shop/ProductCard` (existing, unchanged — takes a single `product: Product` prop).

- [ ] **Step 1: Delete the superseded files**

```bash
git rm components/home/CategoryGrid.tsx components/home/GuideLinksSection.tsx lib/branch-images.ts
```

(`lib/branch-images.ts` is only ever imported by these two files and by `components/layout/Navbar.tsx` — which Task 2 already stopped importing it from. After this step it has zero remaining consumers.)

- [ ] **Step 2: Create `CategoryShowcase.tsx`**

Create `components/home/CategoryShowcase.tsx`:

```tsx
import Image from 'next/image'
import Link from 'next/link'
import productsData from '@/data/products.json'
import categoriesData from '@/data/categories.json'
import type { Product, Category } from '@/lib/types'
import { GUIDE_LINKS } from '@/lib/guide-links'
import { findCategoryBySlugPath } from '@/lib/category-tree'
import { topBestsellers } from '@/lib/reviews'
import ProductCard from '@/components/shop/ProductCard'

const products = productsData as Product[]
const categories = categoriesData as Category[]

function categoryForHref(href: string): Category | undefined {
  const slugPath = href.replace('/shop/', '').split('/')
  return findCategoryBySlugPath(categories, slugPath)
}

export default function CategoryShowcase() {
  const rows = GUIDE_LINKS.slice(0, 4).map(link => ({
    link,
    products: topBestsellers(products, categoryForHref(link.href), 6),
  }))

  return (
    <section className="py-20 bg-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-black text-center mb-12">
          Scegli la tua <em className="text-red">categoria</em>
        </h2>
        <div className="space-y-10">
          {rows.map(({ link, products: rowProducts }) => (
            <div key={link.href} className="flex flex-col lg:flex-row gap-6">
              <Link
                href={link.href}
                className="group relative shrink-0 w-full lg:w-64 aspect-[4/3] lg:aspect-auto rounded-2xl overflow-hidden"
              >
                <Image
                  src={link.image}
                  alt={link.label}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white text-xl font-black">{link.label}</p>
                  <p className="text-white/80 text-xs font-semibold mt-1">Vai ai prodotti →</p>
                </div>
              </Link>
              <div className="flex-1 flex gap-5 overflow-x-auto pb-2">
                {rowProducts.map(p => (
                  <div key={p.id} className="w-56 shrink-0">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Wire into the home page, remove `GuideLinksSection`**

Replace the entire contents of `app/page.tsx` with:

```tsx
import HeroSection from '@/components/home/HeroSection'
import CategoryShowcase from '@/components/home/CategoryShowcase'
import NewArrivalsCarousel from '@/components/home/NewArrivalsCarousel'
import BestsellersSection from '@/components/home/BestsellersSection'
import TrustSection from '@/components/home/TrustSection'
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel'
import BrandCarousel from '@/components/home/BrandCarousel'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryShowcase />
      <NewArrivalsCarousel />
      <BestsellersSection />
      <TrustSection />
      <TestimonialsCarousel />
      <BrandCarousel />
    </>
  )
}
```

- [ ] **Step 4: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds, no dangling imports of the deleted files anywhere (search first: `grep -rn "CategoryGrid\|GuideLinksSection\|branch-images" --include="*.tsx" --include="*.ts" . | grep -v node_modules` should return nothing).

Run: `npm test`
Expected: all tests pass (`__tests__/guide-links.test.ts` and others are unaffected — none of them reference the deleted files).

- [ ] **Step 5: Commit**

```bash
git add -A components/home/CategoryShowcase.tsx components/home/CategoryGrid.tsx components/home/GuideLinksSection.tsx lib/branch-images.ts app/page.tsx
git commit -m "feat: replace home category grid with promo-tile + bestseller product rows"
```

---

### Task 5: Full build + test + manual verification

**Files:** None (verification only).

- [ ] **Step 1: Full automated check**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: no type errors, all tests pass, build succeeds with the home route (`/`) and no broken imports.

- [ ] **Step 2: Manual browser verification**

Start the production server (`npm run start`, port 3000) and check:

1. Home page (`/`): hero shows the contained banner (not full-screen), 3 category quick-link cards to its right, 4-item trust strip below. `CategoryShowcase` section below it shows 4 rows, each with a promo tile and a horizontally-scrollable strip of real product cards (photo, name, price, add-to-cart button all render).
2. Hover each of the 3 top-nav categories (Monta Inglese / Monta Western / Scuderia): panel opens with a left sidebar of sub-categories, a center grid of leaf-category tiles for the first (default-selected) sidebar item, and a right "In evidenza" column of 4 real products with photo/name/price.
3. Hover a different sidebar item within an open panel: confirm the center grid updates to that item's leaf categories, and the sidebar highlight moves — without the panel closing.
4. Move the mouse out of the top-nav item and back in: confirm the sidebar selection resets to the first item each time (not sticky from a previous hover).
5. Click a product in the mega menu's "In evidenza" column: confirm it navigates to the correct `/prodotto/[slug]` page.
6. Click a promo tile and a product's "aggiungi al carrello" button in the new home category rows: confirm navigation and cart-add both work.
7. Browser console: no errors on `/`.

- [ ] **Step 3: Record findings**

If any check in Step 2 fails, fix it before proceeding — do not mark this task complete with a known-broken interaction.
