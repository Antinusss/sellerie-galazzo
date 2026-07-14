### Task 2: Shared search logic

**Files:**
- Create: `lib/search.ts`
- Test: `__tests__/search.test.ts`
- Modify: `components/layout/SearchOverlay.tsx`

**Interfaces:**
- Produces: `searchProducts(products: Product[], query: string, limit?: number): Product[]` — consumed by Task 4's `HeaderSearchBar` and this task's updated `SearchOverlay`.

- [ ] **Step 1: Write the failing tests**

Create `__tests__/search.test.ts`:

```ts
import { searchProducts } from '@/lib/search'
import type { Product } from '@/lib/types'

function product(id: string, name: string): Product {
  return {
    id, name, slug: `p${id}`, price: 100, originalPrice: null,
    category: 'Scuderia', categoryPath: ['Scuderia'], brand: 'X', images: [],
    description: '', specs: '', inStock: true,
  }
}

const products = [product('1', 'Cavezza corda'), product('2', 'Cavezza nylon'), product('3', 'Sella inglese')]

describe('searchProducts', () => {
  it('returns [] for an empty query', () => {
    expect(searchProducts(products, '')).toEqual([])
  })
  it('returns [] for a whitespace-only query', () => {
    expect(searchProducts(products, '   ')).toEqual([])
  })
  it('matches case-insensitively on product name', () => {
    expect(searchProducts(products, 'CAVEZZA').map(p => p.id)).toEqual(['1', '2'])
  })
  it('respects the limit', () => {
    expect(searchProducts(products, 'cavezza', 1).map(p => p.id)).toEqual(['1'])
  })
  it('returns [] when nothing matches', () => {
    expect(searchProducts(products, 'zzz')).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- search`
Expected: FAIL with "Cannot find module '@/lib/search'"

- [ ] **Step 3: Implement `lib/search.ts`**

```ts
import type { Product } from './types'

export function searchProducts(products: Product[], query: string, limit = 8): Product[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return products.filter(p => p.name.toLowerCase().includes(q)).slice(0, limit)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- search`
Expected: PASS (5/5 tests green)

- [ ] **Step 5: Update `components/layout/SearchOverlay.tsx` to use it**

Replace:

```tsx
import allProducts from '@/data/products.json'
import type { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

const products = allProducts as Product[]
```

with:

```tsx
import allProducts from '@/data/products.json'
import type { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { searchProducts } from '@/lib/search'

const products = allProducts as Product[]
```

Replace:

```tsx
  const q = query.trim().toLowerCase()
  const results = q
    ? products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8)
    : []
```

with:

```tsx
  const results = searchProducts(products, query)
```

And replace the one usage of `{q && (` with `{query.trim() && (` (the local `q` variable no longer exists):

```tsx
          {query.trim() && (
            <div className="max-h-[60vh] overflow-y-auto">
```

- [ ] **Step 6: Run the full suite and typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: all tests PASS, zero TypeScript errors

- [ ] **Step 7: Commit**

```bash
git add lib/search.ts __tests__/search.test.ts components/layout/SearchOverlay.tsx
git commit -m "feat: extract shared searchProducts, reuse in SearchOverlay"
```

---

