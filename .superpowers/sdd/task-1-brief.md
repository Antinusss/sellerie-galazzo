### Task 1: Wishlist data layer

**Files:**
- Create: `lib/wishlist-store.ts`
- Test: `__tests__/wishlist-store.test.ts`

**Interfaces:**
- Produces: `useWishlistStore(): { productIds: string[]; toggleWishlist(productId: string): void; isWishlisted(productId: string): boolean }` — a Zustand hook, imported by Task 3, 4, and 5.

- [ ] **Step 1: Write the failing test**

Create `__tests__/wishlist-store.test.ts`:

```ts
import { act, renderHook } from '@testing-library/react'
import { useWishlistStore } from '@/lib/wishlist-store'

beforeEach(() => {
  const { result } = renderHook(() => useWishlistStore())
  act(() => {
    for (const id of [...result.current.productIds]) result.current.toggleWishlist(id)
  })
})

describe('toggleWishlist', () => {
  it('adds a product id when not present', () => {
    const { result } = renderHook(() => useWishlistStore())
    act(() => result.current.toggleWishlist('42'))
    expect(result.current.productIds).toEqual(['42'])
  })

  it('removes a product id when already present', () => {
    const { result } = renderHook(() => useWishlistStore())
    act(() => result.current.toggleWishlist('42'))
    act(() => result.current.toggleWishlist('42'))
    expect(result.current.productIds).toEqual([])
  })

  it('supports multiple distinct ids', () => {
    const { result } = renderHook(() => useWishlistStore())
    act(() => result.current.toggleWishlist('1'))
    act(() => result.current.toggleWishlist('2'))
    expect(result.current.productIds).toEqual(['1', '2'])
  })
})

describe('isWishlisted', () => {
  it('returns false for an id never added', () => {
    const { result } = renderHook(() => useWishlistStore())
    expect(result.current.isWishlisted('999')).toBe(false)
  })

  it('returns true after toggling on', () => {
    const { result } = renderHook(() => useWishlistStore())
    act(() => result.current.toggleWishlist('7'))
    expect(result.current.isWishlisted('7')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/wishlist-store.test.ts`
Expected: FAIL with `Cannot find module '@/lib/wishlist-store'`

- [ ] **Step 3: Write minimal implementation**

Create `lib/wishlist-store.ts`:

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  productIds: string[]
  toggleWishlist: (productId: string) => void
  isWishlisted: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggleWishlist: (productId) =>
        set(s => ({
          productIds: s.productIds.includes(productId)
            ? s.productIds.filter(id => id !== productId)
            : [...s.productIds, productId],
        })),
      isWishlisted: (productId) => get().productIds.includes(productId),
    }),
    { name: 'selleria-galazzo-wishlist' }
  )
)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/wishlist-store.test.ts`
Expected: PASS, 5/5 tests

- [ ] **Step 5: Commit**

```bash
git add lib/wishlist-store.ts __tests__/wishlist-store.test.ts
git commit -m "feat: add wishlist store"
```
