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

