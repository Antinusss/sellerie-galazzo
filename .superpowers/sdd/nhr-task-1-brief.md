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

