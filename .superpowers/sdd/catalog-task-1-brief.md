### Task 1: Update types and existing test fixtures

**Files:**
- Modify: `lib/types.ts`
- Modify: `__tests__/utils.test.ts`
- Modify: `__tests__/store.test.ts`

**Interfaces:**
- Produces: `Product` (with `categoryPath: string[]`), `Category` (`path`, `slug: string[]`, `name`, `depth`, `productCount`, `image?`), `Brand` (`id`, `name`, `productCount`) — every later task imports these from `lib/types`.

- [ ] **Step 1: Update `lib/types.ts`**

```ts
export interface Product {
  id: string
  name: string
  slug: string
  price: number        // in cents, e.g. 17000 = €170.00
  originalPrice: number | null  // always null — feed has no discount data
  category: string      // top-level branch, e.g. "Monta Inglese"
  categoryPath: string[] // full path, e.g. ["Monta Inglese", "Cavaliere", "Donna", "Pantaloni"]
  brand: string          // may be '' — ~6% of feed items have no brand
  images: string[]       // URLs, single element (feed has one image per product)
  description: string
  specs: string           // pipe-joined bullet items, may be ''
  inStock: boolean
}

export interface Category {
  path: string[]    // e.g. ["Monta Inglese", "Cavaliere"]
  slug: string[]    // slugified per segment, e.g. ["monta-inglese", "cavaliere"]
  name: string       // last segment, e.g. "Cavaliere"
  depth: number       // path.length
  productCount: number
  image?: string       // only set on the 3 top-level (depth 1) nodes
}

export interface Brand {
  id: string
  name: string
  productCount: number
}

export interface CartItem {
  product: Product
  quantity: number
  variant?: string
}
```

- [ ] **Step 2: Update `__tests__/utils.test.ts` fixture**

In the `getProductBySlug` describe block, replace the `products` array literal:

```ts
describe('getProductBySlug', () => {
  const products: Product[] = [
    { id: '1', name: 'Test Product', slug: 'test-product', price: 1000, originalPrice: null,
      category: 'Monta Inglese', categoryPath: ['Monta Inglese'], brand: 'Equestro', images: [],
      description: '', specs: '', inStock: true },
  ]
  it('finds product by slug', () => expect(getProductBySlug('test-product', products)?.id).toBe('1'))
  it('returns undefined for missing slug', () => expect(getProductBySlug('nope', products)).toBeUndefined())
})
```

- [ ] **Step 3: Update `__tests__/store.test.ts` fixture**

Replace the `mockProduct` literal:

```ts
const mockProduct: Product = {
  id: '1', name: 'Test', slug: 'test', price: 5000, originalPrice: null,
  category: 'Monta Inglese', categoryPath: ['Monta Inglese'], brand: 'Test', images: [],
  description: '', specs: '', inStock: true,
}
```

- [ ] **Step 4: Run the existing suite to confirm it's still green**

Run: `npm test`
Expected: PASS (14 tests, same as before — this task only changes types/fixtures, not logic)

- [ ] **Step 5: Commit**

```bash
git add lib/types.ts __tests__/utils.test.ts __tests__/store.test.ts
git commit -m "refactor: widen Product/Category/Brand types for real catalog data"
```

---

