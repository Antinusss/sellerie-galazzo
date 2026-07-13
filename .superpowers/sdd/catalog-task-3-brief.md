### Task 3: `lib/category-tree.ts` — pure category-tree lookups

**Files:**
- Create: `lib/category-tree.ts`
- Test: `__tests__/category-tree.test.ts`

**Interfaces:**
- Consumes: `Category`, `Product` from `lib/types` (Task 1)
- Produces: `findCategoryBySlugPath(categories: Category[], slugPath: string[]): Category | undefined`, `getChildren(categories: Category[], parent: Category | undefined): Category[]`, `getTopLevelCategories(categories: Category[]): Category[]`, `productsUnderCategory(products: Product[], category: Category | undefined): Product[]`, `breadcrumbFor(category: Category | undefined): string` — consumed by `FilterSidebar`, `Navbar`, `Footer`, `CategoryGrid`, and `app/shop/[[...slug]]/page.tsx` (Tasks 6, 9, 10).

- [ ] **Step 1: Write the failing tests**

Create `__tests__/category-tree.test.ts`:

```ts
import {
  findCategoryBySlugPath,
  getChildren,
  getTopLevelCategories,
  productsUnderCategory,
  breadcrumbFor,
} from '@/lib/category-tree'
import type { Category, Product } from '@/lib/types'

const categories: Category[] = [
  { path: ['Monta Inglese'], slug: ['monta-inglese'], name: 'Monta Inglese', depth: 1, productCount: 3 },
  { path: ['Monta Inglese', 'Cavallo'], slug: ['monta-inglese', 'cavallo'], name: 'Cavallo', depth: 2, productCount: 2 },
  { path: ['Monta Inglese', 'Cavaliere'], slug: ['monta-inglese', 'cavaliere'], name: 'Cavaliere', depth: 2, productCount: 1 },
  { path: ['Scuderia'], slug: ['scuderia'], name: 'Scuderia', depth: 1, productCount: 1 },
]

function product(id: string, categoryPath: string[]): Product {
  return {
    id, name: `P${id}`, slug: `p${id}`, price: 100, originalPrice: null,
    category: categoryPath[0], categoryPath, brand: 'X', images: [],
    description: '', specs: '', inStock: true,
  }
}

const products: Product[] = [
  product('1', ['Monta Inglese', 'Cavallo']),
  product('2', ['Monta Inglese', 'Cavallo']),
  product('3', ['Monta Inglese', 'Cavaliere']),
  product('4', ['Scuderia']),
]

describe('findCategoryBySlugPath', () => {
  it('finds a nested node by its full slug path', () => {
    expect(findCategoryBySlugPath(categories, ['monta-inglese', 'cavallo'])?.name).toBe('Cavallo')
  })
  it('returns undefined for an unknown path', () => {
    expect(findCategoryBySlugPath(categories, ['nope'])).toBeUndefined()
  })
  it('returns undefined for an empty path', () => {
    expect(findCategoryBySlugPath(categories, [])).toBeUndefined()
  })
})

describe('getTopLevelCategories', () => {
  it('returns depth-1 nodes sorted by productCount descending', () => {
    expect(getTopLevelCategories(categories).map(c => c.name)).toEqual(['Monta Inglese', 'Scuderia'])
  })
})

describe('getChildren', () => {
  it('returns direct children of a node, sorted by productCount descending', () => {
    const montaInglese = categories[0]
    expect(getChildren(categories, montaInglese).map(c => c.name)).toEqual(['Cavallo', 'Cavaliere'])
  })
  it('returns [] for a leaf node', () => {
    const cavallo = categories[1]
    expect(getChildren(categories, cavallo)).toEqual([])
  })
})

describe('productsUnderCategory', () => {
  it('returns all products when category is undefined', () => {
    expect(productsUnderCategory(products, undefined)).toHaveLength(4)
  })
  it('returns products under a top-level node, including descendants', () => {
    const montaInglese = categories[0]
    expect(productsUnderCategory(products, montaInglese).map(p => p.id).sort()).toEqual(['1', '2', '3'])
  })
  it('returns only products matching a leaf node exactly', () => {
    const cavallo = categories[1]
    expect(productsUnderCategory(products, cavallo).map(p => p.id).sort()).toEqual(['1', '2'])
  })
})

describe('breadcrumbFor', () => {
  it('joins the path with " / "', () => {
    expect(breadcrumbFor(categories[1])).toBe('Monta Inglese / Cavallo')
  })
  it('returns a fallback label for undefined (root)', () => {
    expect(breadcrumbFor(undefined)).toBe('Tutti i prodotti')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- category-tree`
Expected: FAIL with "Cannot find module '@/lib/category-tree'"

- [ ] **Step 3: Implement `lib/category-tree.ts`**

```ts
import type { Category, Product } from './types'

export function findCategoryBySlugPath(categories: Category[], slugPath: string[]): Category | undefined {
  if (slugPath.length === 0) return undefined
  return categories.find(
    c => c.slug.length === slugPath.length && c.slug.every((s, i) => s === slugPath[i])
  )
}

export function getChildren(categories: Category[], parent: Category | undefined): Category[] {
  const parentDepth = parent ? parent.depth : 0
  const parentSlug = parent ? parent.slug : []
  return categories
    .filter(c => c.depth === parentDepth + 1 && parentSlug.every((s, i) => c.slug[i] === s))
    .sort((a, b) => b.productCount - a.productCount)
}

export function getTopLevelCategories(categories: Category[]): Category[] {
  return getChildren(categories, undefined)
}

export function productsUnderCategory(products: Product[], category: Category | undefined): Product[] {
  if (!category) return products
  return products.filter(
    p => p.categoryPath.length >= category.path.length &&
      category.path.every((seg, i) => p.categoryPath[i] === seg)
  )
}

export function breadcrumbFor(category: Category | undefined): string {
  return category ? category.path.join(' / ') : 'Tutti i prodotti'
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- category-tree`
Expected: PASS (all cases above green)

- [ ] **Step 5: Commit**

```bash
git add lib/category-tree.ts __tests__/category-tree.test.ts
git commit -m "feat: add pure category-tree lookup helpers"
```

---

