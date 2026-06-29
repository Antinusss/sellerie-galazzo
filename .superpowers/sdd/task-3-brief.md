### Task 3: Zustand Cart Store

**Files:**
- Create: `lib/store.ts`
- Create: `__tests__/store.test.ts`

**Produces:**
- `useCartStore()` hook with: `items: CartItem[]`, `addItem(product, quantity, variant?)`, `removeItem(productId)`, `updateQuantity(productId, quantity)`, `clearCart()`, `totalItems: number`, `totalPrice: number`

- [ ] **Step 1: Write failing tests**

Create `__tests__/store.test.ts`:

```typescript
import { act, renderHook } from '@testing-library/react'
import { useCartStore } from '@/lib/store'
import type { Product } from '@/lib/types'

const mockProduct: Product = {
  id: '1', name: 'Test', slug: 'test', price: 5000, originalPrice: null,
  category: 'Monta Inglese', brand: 'Test', images: [], description: '', specs: '', inStock: true,
}

beforeEach(() => {
  const { result } = renderHook(() => useCartStore())
  act(() => result.current.clearCart())
})

describe('addItem', () => {
  it('adds new item', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem(mockProduct, 1))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(1)
  })
  it('increments existing item quantity', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem(mockProduct, 1))
    act(() => result.current.addItem(mockProduct, 2))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(3)
  })
})

describe('removeItem', () => {
  it('removes item by product id', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem(mockProduct, 1))
    act(() => result.current.removeItem('1'))
    expect(result.current.items).toHaveLength(0)
  })
})

describe('updateQuantity', () => {
  it('updates quantity', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem(mockProduct, 1))
    act(() => result.current.updateQuantity('1', 5))
    expect(result.current.items[0].quantity).toBe(5)
  })
})

describe('computed values', () => {
  it('totalItems counts all quantities', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem(mockProduct, 3))
    expect(result.current.totalItems).toBe(3)
  })
  it('totalPrice sums prices in cents', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem(mockProduct, 2))
    expect(result.current.totalPrice).toBe(10000)
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx jest __tests__/store.test.ts
```

Expected: `Cannot find module '@/lib/store'`

- [ ] **Step 3: Implement store**

Create `lib/store.ts`:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from './types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity: number, variant?: string) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity, variant) => {
        const existing = get().items.find(i => i.product.id === product.id)
        if (existing) {
          set(s => ({
            items: s.items.map(i =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
            ),
          }))
        } else {
          set(s => ({ items: [...s.items, { product, quantity, variant }] }))
        }
      },
      removeItem: (productId) =>
        set(s => ({ items: s.items.filter(i => i.product.id !== productId) })),
      updateQuantity: (productId, quantity) =>
        set(s => ({
          items: s.items.map(i => i.product.id === productId ? { ...i, quantity } : i),
        })),
      clearCart: () => set({ items: [] }),
      get totalItems() { return get().items.reduce((sum, i) => sum + i.quantity, 0) },
      get totalPrice() { return get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0) },
    }),
    { name: 'selleria-galazzo-cart' }
  )
)
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx jest __tests__/store.test.ts
```

Expected: 7 tests passing.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: Zustand cart store with persist middleware"
```

---

