### Task 1: Cart-drawer state in the store

**Files:**
- Modify: `lib/store.ts`
- Modify: `__tests__/store.test.ts`

**Interfaces:**
- Produces: `CartStore.isCartOpen: boolean`, `CartStore.openCart(): void`, `CartStore.closeCart(): void` — consumed by Tasks 4, 5, 6.

- [ ] **Step 1: Write the failing tests**

In `__tests__/store.test.ts`, change the `beforeEach` to also reset the drawer state:

```ts
beforeEach(() => {
  const { result } = renderHook(() => useCartStore())
  act(() => result.current.clearCart())
  act(() => result.current.closeCart())
})
```

Add a new describe block at the end of the file:

```ts
describe('cart drawer state', () => {
  it('starts closed', () => {
    const { result } = renderHook(() => useCartStore())
    expect(result.current.isCartOpen).toBe(false)
  })
  it('openCart sets isCartOpen to true', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.openCart())
    expect(result.current.isCartOpen).toBe(true)
  })
  it('closeCart sets isCartOpen to false', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.openCart())
    act(() => result.current.closeCart())
    expect(result.current.isCartOpen).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- store`
Expected: FAIL with "closeCart is not a function" (or similar — the store doesn't have this shape yet)

- [ ] **Step 3: Update `lib/store.ts`**

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from './types'

interface InternalState {
  items: CartItem[]
  isCartOpen: boolean
  addItem: (product: Product, quantity: number, variant?: string) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
}

export interface CartStore extends InternalState {
  totalItems: number
  totalPrice: number
}

const useInternalStore = create<InternalState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
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
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
    }),
    {
      name: 'selleria-galazzo-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)

export function useCartStore(): CartStore {
  const store = useInternalStore()
  const { items } = store
  return {
    ...store,
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- store`
Expected: PASS (all store tests green, including the 3 new ones)

- [ ] **Step 5: Commit**

```bash
git add lib/store.ts __tests__/store.test.ts
git commit -m "feat: add cart-drawer open/close state to the cart store"
```

---

