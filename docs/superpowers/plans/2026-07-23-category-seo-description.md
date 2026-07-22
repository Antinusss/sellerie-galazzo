# Category Page SEO Description Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every resolved category page (`/shop/[[...slug]]`) gets a real, template-generated description — as visible on-page copy and as the page's `<meta name="description">` — with zero fabricated content.

**Architecture:** One new pure function (`categoryDescription`) generates the description string from real `Category` fields (`name`, `productCount`, `path`). The category page imports it twice: once in the rendered JSX (visible paragraph) and once in a new `generateMetadata` export (meta tag) — both call sites resolve the same category independently, which is the standard Next.js App Router pattern (`generateMetadata` and the page component are separate functions with no shared state).

**Tech Stack:** Next.js 14 App Router, TypeScript, Jest.

## Global Constraints

- Every category in `data/categories.json` has `productCount >= 2` (verified: min 2, max 2334 across all 123 categories) — no singular/plural grammar handling needed anywhere in this plan.
- The description only applies when a `category` resolves (i.e., not on the unfiltered `/shop` root — `slugPath.length === 0`).
- `generateMetadata` and `ShopPage` (the default export) both independently resolve `category` from `params.slug` using the same 2-line `findCategoryBySlugPath` call. This is expected duplication (the two functions have no way to share state in Next.js App Router) — not a DRY violation to fix.
- Real, already-published site facts only: "reso entro 14 giorni" and "spedizione tracciata"/"spedizione rapida" match `/resi-e-rimborsi` and `/spedizioni` — no new claims are introduced.

---

### Task 1: `categoryDescription` template helper

**Files:**
- Create: `lib/category-description.ts`
- Test: `__tests__/category-description.test.ts`

**Interfaces:**
- Produces: `categoryDescription(category: Category): string` from `@/lib/category-description` — consumed by Task 2.

- [ ] **Step 1: Write the failing tests**

Create `__tests__/category-description.test.ts`:

```ts
import { categoryDescription } from '@/lib/category-description'
import type { Category } from '@/lib/types'

function category(overrides: Partial<Category>): Category {
  return {
    path: ['Monta Inglese'], slug: ['monta-inglese'], name: 'Monta Inglese',
    depth: 1, productCount: 10, ...overrides,
  }
}

describe('categoryDescription', () => {
  it('uses the branch template for depth-1 categories', () => {
    const cat = category({ path: ['Scuderia'], slug: ['scuderia'], name: 'Scuderia', depth: 1, productCount: 345 })
    expect(categoryDescription(cat)).toBe(
      'Tutto il necessario per Scuderia: 345 prodotti selezionati, spedizione rapida in tutta Italia e reso entro 14 giorni.'
    )
  })

  it('uses the parent-referencing template for depth-3 categories, referencing the immediate parent', () => {
    const cat = category({
      path: ['Monta Inglese', 'Cavaliere', 'Selle e accessori'],
      slug: ['monta-inglese', 'cavaliere', 'selle-e-accessori'],
      name: 'Selle e accessori', depth: 3, productCount: 42,
    })
    expect(categoryDescription(cat)).toBe(
      'Scopri i nostri 42 prodotti di Selle e accessori per Cavaliere: qualità professionale, spedizione tracciata e reso entro 14 giorni.'
    )
  })

  it('references the top-level branch as parent for depth-2 categories', () => {
    const cat = category({
      path: ['Monta Inglese', 'Cavaliere'],
      slug: ['monta-inglese', 'cavaliere'],
      name: 'Cavaliere', depth: 2, productCount: 120,
    })
    expect(categoryDescription(cat)).toBe(
      'Scopri i nostri 120 prodotti di Cavaliere per Monta Inglese: qualità professionale, spedizione tracciata e reso entro 14 giorni.'
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- category-description.test.ts`
Expected: FAIL — `Cannot find module '@/lib/category-description'`.

- [ ] **Step 3: Implement `categoryDescription`**

Create `lib/category-description.ts`:

```ts
import type { Category } from './types'

export function categoryDescription(category: Category): string {
  if (category.depth === 1) {
    return `Tutto il necessario per ${category.name}: ${category.productCount} prodotti selezionati, spedizione rapida in tutta Italia e reso entro 14 giorni.`
  }
  const parent = category.path[category.path.length - 2]
  return `Scopri i nostri ${category.productCount} prodotti di ${category.name} per ${parent}: qualità professionale, spedizione tracciata e reso entro 14 giorni.`
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- category-description.test.ts`
Expected: PASS, all 3 tests.

- [ ] **Step 5: Run the full suite and typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: all tests pass (no regressions), no type errors.

- [ ] **Step 6: Commit**

```bash
git add lib/category-description.ts __tests__/category-description.test.ts
git commit -m "feat: add categoryDescription SEO template helper"
```

---

### Task 2: Wire into the category page (visible copy + meta description)

**Files:**
- Modify: `app/shop/[[...slug]]/page.tsx`

**Interfaces:**
- Consumes: `categoryDescription(category: Category): string` from Task 1.

- [ ] **Step 1: Replace the full file**

Replace the entire contents of `app/shop/[[...slug]]/page.tsx` with:

```tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import allProducts from '@/data/products.json'
import allCategories from '@/data/categories.json'
import type { Product, Category } from '@/lib/types'
import { findCategoryBySlugPath, productsUnderCategory, breadcrumbFor } from '@/lib/category-tree'
import { categoryDescription } from '@/lib/category-description'
import ShopCategoryClient from '@/components/shop/ShopCategoryClient'

interface Props { params: { slug?: string[] } }

export async function generateStaticParams() {
  const nodes = (allCategories as Category[]).map(c => ({ slug: c.slug }))
  return [{ slug: [] }, ...nodes]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slugPath = params.slug ?? []
  const category = slugPath.length > 0
    ? findCategoryBySlugPath(allCategories as Category[], slugPath)
    : undefined

  if (!category) return { title: 'Shop — Selleria Galazzo' }

  return {
    title: `${category.name} — Selleria Galazzo`,
    description: categoryDescription(category),
  }
}

export default function ShopPage({ params }: Props) {
  const slugPath = params.slug ?? []
  const category = slugPath.length > 0
    ? findCategoryBySlugPath(allCategories as Category[], slugPath)
    : undefined

  if (slugPath.length > 0 && !category) notFound()

  const products = productsUnderCategory(allProducts as Product[], category)
  const title = category ? category.name : 'Tutto il'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <p className="text-xs text-gray-400 mb-2">{breadcrumbFor(category)}</p>
      <h1 className={`text-4xl font-black ${category ? 'mb-3' : 'mb-8'}`}>
        {title} <em className="text-red">Shop</em>
      </h1>
      {category && (
        <p className="text-sm text-gray-500 max-w-2xl mb-8">{categoryDescription(category)}</p>
      )}
      <Suspense fallback={<div>Caricamento...</div>}>
        <ShopCategoryClient products={products} currentPath={slugPath} />
      </Suspense>
    </div>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds — all `/shop/**` static routes still generate (same count as before this change).

Run: `npm test`
Expected: all tests pass (this file has no dedicated test suite; this just guards against an unrelated regression).

- [ ] **Step 3: Commit**

```bash
git add "app/shop/[[...slug]]/page.tsx"
git commit -m "feat: show SEO description on category pages, add meta description"
```

---

### Task 3: Full build + test + manual verification

**Files:** None (verification only).

- [ ] **Step 1: Full automated check**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: no type errors, all tests pass, build succeeds with all `/shop/**` routes intact.

- [ ] **Step 2: Manual browser verification**

Start the production server (`npm run start`, port 3000) and check:

1. A depth-1 branch page (`/shop/scuderia`): visible description paragraph appears below the H1, reads "Tutto il necessario per Scuderia: 345 prodotti selezionati, spedizione rapida in tutta Italia e reso entro 14 giorni." (or the current real product count for Scuderia — confirm it's a real number, not a placeholder).
2. A deeper category page (e.g. `/shop/monta-inglese/cavaliere` or any depth ≥2 leaf under it): description reads "Scopri i nostri N prodotti di {name} per {parent}: qualità professionale, spedizione tracciata e reso entro 14 giorni." with the correct immediate-parent name.
3. The root `/shop` page: no description paragraph renders, and the H1-to-grid spacing looks the same as it did before this change (no visual regression from the conditional `mb-3`/`mb-8` class).
4. View page source (or use the browser's dev tools Elements panel) on a category page: confirm `<meta name="description" content="...">` is present in the `<head>` and matches the visible paragraph text exactly.
5. Browser console: no errors on any of the above pages.

- [ ] **Step 3: Record findings**

If any check in Step 2 fails, fix it before proceeding — do not mark this task complete with a known-broken interaction.
