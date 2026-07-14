# Trust & Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a slide-out cart drawer, visible payment-method options (PayPal/Klarna BNPL/bank transfer) at checkout, fabricated-but-plausible customer reviews, and an always-visible header search bar to the Selleria Galazzo mockup.

**Architecture:** Two new pure/tested `lib/` modules (`lib/search.ts`, `lib/reviews.ts`) power a new `CartDrawer` and a new desktop `HeaderSearchBar`, both wired into a restructured two-row `Navbar`. The cart store gains UI-open state (`isCartOpen`) alongside the existing cart data, with `partialize` so only cart contents survive a page reload. Reviews and Klarna messaging are additive UI on existing product components; the checkout payment step gets a method selector that swaps the existing card fields for short mockup copy on non-card methods.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Zustand (existing store), Lucide React (existing icon set, adds `Star`), Jest + ts-jest (existing).

## Global Constraints

- No real payment processing for any method — PayPal/Klarna/Bonifico are equally mock as the existing card fields already were.
- No Klarna logo/brand asset — text-only badge in their signature pink (`#FFB3C7`), never their actual logo.
- Reviews are entirely fabricated, deterministic (hashed from `product.id`, never `Math.random()` — output must be stable across builds/renders), and isolated in `lib/reviews.ts` (not touching `lib/feed-transform.ts`), same reasoning as the existing `lib/offers.ts` exception.
- Mobile search stays icon + full-screen `SearchOverlay` — no inline bar below the `md` breakpoint. Desktop (`md:` and up) gets the new always-visible `HeaderSearchBar`.
- `isCartOpen` must never be persisted to `localStorage` — only `items`.

---

## File Structure

New:
- `lib/search.ts` — `searchProducts`, extracted from `SearchOverlay`'s inline filter, tested.
- `lib/reviews.ts` — `getReviewSummary`, deterministic fake reviews, tested.
- `components/cart/CartDrawer.tsx` — slide-out panel, always mounted in `Navbar`, visibility driven by store state.
- `components/layout/HeaderSearchBar.tsx` — desktop inline search + dropdown.
- `__tests__/search.test.ts`, `__tests__/reviews.test.ts`.

Modified:
- `lib/store.ts` — `isCartOpen`/`openCart`/`closeCart`, `partialize`.
- `__tests__/store.test.ts` — new test coverage for the drawer state.
- `components/layout/SearchOverlay.tsx` — uses the shared `searchProducts` instead of its own inline filter.
- `components/layout/Navbar.tsx` — two-row layout, `HeaderSearchBar` on row 1, cart icon becomes an `openCart` trigger, renders `CartDrawer`.
- `components/shop/ProductCard.tsx` — review stars + count, quick-add now also opens the cart.
- `components/product/ProductInfo.tsx` — review stars + count, Klarna BNPL line, add-to-cart also opens the cart.
- `components/product/ProductTabs.tsx` — new "Recensioni (N)" tab; gains a `productId` prop.
- `app/prodotto/[slug]/page.tsx` — passes `productId` to `ProductTabs`.
- `components/home/HeroSection.tsx` — 4th trust stat.
- `app/checkout/page.tsx` — payment-method selector in step 3.

---

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

### Task 3: Fake reviews

**Files:**
- Create: `lib/reviews.ts`
- Test: `__tests__/reviews.test.ts`

**Interfaces:**
- Produces: `Review = { author: string; rating: number; date: string; text: string }`,
  `ReviewSummary = { rating: number; count: number; reviews: Review[] }`,
  `getReviewSummary(productId: string): ReviewSummary` — consumed by Tasks 5, 6, 7 (`ProductCard`, `ProductInfo`, `ProductTabs`).

- [ ] **Step 1: Write the failing tests**

Create `__tests__/reviews.test.ts`:

```ts
import { getReviewSummary } from '@/lib/reviews'

describe('getReviewSummary', () => {
  it('is deterministic for the same product id', () => {
    expect(getReviewSummary('67217')).toEqual(getReviewSummary('67217'))
  })

  it('returns a rating from the positive-skewed pool', () => {
    const { rating } = getReviewSummary('15')
    expect([4.2, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0]).toContain(rating)
  })

  it('returns a count between 3 and 120', () => {
    const { count } = getReviewSummary('42')
    expect(count).toBeGreaterThanOrEqual(3)
    expect(count).toBeLessThanOrEqual(120)
  })

  it('caps sample reviews at 5 even when count is higher', () => {
    const { count, reviews } = getReviewSummary('117')
    expect(count).toBeGreaterThan(5)
    expect(reviews.length).toBe(5)
  })

  it('returns fewer sample reviews than 5 when count is under 5', () => {
    const { count, reviews } = getReviewSummary('118')
    expect(count).toBe(3)
    expect(reviews.length).toBe(3)
  })

  it('every sample review has a non-empty author/date/text and a plausible rating', () => {
    const { reviews } = getReviewSummary('999')
    for (const r of reviews) {
      expect(r.author.length).toBeGreaterThan(0)
      expect(r.date.length).toBeGreaterThan(0)
      expect(r.text.length).toBeGreaterThan(0)
      expect(r.rating).toBeGreaterThanOrEqual(3.5)
      expect(r.rating).toBeLessThanOrEqual(5.0)
    }
  })

  it('produces different output for different product ids', () => {
    const a = getReviewSummary('10')
    const b = getReviewSummary('11')
    expect(a).not.toEqual(b)
  })

  it('does not throw for a non-numeric id and stays deterministic', () => {
    expect(() => getReviewSummary('abc')).not.toThrow()
    expect(getReviewSummary('abc')).toEqual(getReviewSummary('abc'))
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- reviews`
Expected: FAIL with "Cannot find module '@/lib/reviews'"

- [ ] **Step 3: Implement `lib/reviews.ts`**

```ts
export interface Review {
  author: string
  rating: number
  date: string
  text: string
}

export interface ReviewSummary {
  rating: number
  count: number
  reviews: Review[]
}

const AUTHORS = [
  'Giulia R.', 'Marco B.', 'Francesca T.', 'Luca P.', 'Elena M.', 'Andrea C.',
  'Sara D.', 'Davide F.', 'Chiara V.', 'Matteo G.', 'Valentina S.', 'Simone L.',
  'Alessia N.', 'Federico Z.', 'Martina A.',
]

const DATES = ['3 giorni fa', '1 settimana fa', '2 settimane fa', '3 settimane fa', '1 mese fa', '2 mesi fa']

const TEXTS = [
  'Prodotto di ottima qualità, esattamente come descritto. Consigliato!',
  'Spedizione velocissima e imballo curato. Il prodotto è perfetto.',
  'Ottimo rapporto qualità prezzo, lo ricomprerei senza dubbio.',
  'Materiali robusti e ben rifiniti, si vede la qualità.',
  'Esattamente quello che cercavo per il mio cavallo, top.',
  'Arrivato in tempi rapidi, confezione integra. Molto soddisfatto.',
  'Qualità superiore alle aspettative, consigliatissimo.',
  'Un acquisto azzeccato, funziona benissimo e sembra durare nel tempo.',
  'Servizio clienti gentile e prodotto conforme alla descrizione.',
  'Ottimo prodotto, il mio cavallo lo adora già dal primo utilizzo.',
  'Buona qualità costruttiva, prezzo onesto per quello che offre.',
  'Consegna puntuale e prodotto identico alle foto. Tutto perfetto.',
  'Non è il massimo ma per il prezzo va benissimo.',
  'Comodo e pratico da usare, lo consiglio a tutti i cavalieri.',
  'Selleria affidabile, secondo acquisto e sono sempre soddisfatto.',
]

const RATING_POOL = [4.2, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0]

function hashOf(id: string): number {
  const n = Number(id)
  return Number.isFinite(n) ? n : id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0)
}

export function getReviewSummary(productId: string): ReviewSummary {
  const hash = hashOf(productId)
  const rating = RATING_POOL[hash % RATING_POOL.length]
  const count = 3 + (hash % 118)
  const sampleSize = Math.min(5, count)
  const individualRatings = [5.0, rating, rating, Math.max(3.5, rating - 1), 4.5]

  const reviews: Review[] = Array.from({ length: sampleSize }, (_, i) => {
    const offset = hash + i * 7
    return {
      author: AUTHORS[offset % AUTHORS.length],
      rating: individualRatings[i % individualRatings.length],
      date: DATES[offset % DATES.length],
      text: TEXTS[offset % TEXTS.length],
    }
  })

  return { rating, count, reviews }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- reviews`
Expected: PASS (8/8 tests green)

- [ ] **Step 5: Commit**

```bash
git add lib/reviews.ts __tests__/reviews.test.ts
git commit -m "feat: add deterministic fake-review generator"
```

---

### Task 4: Cart drawer + Navbar restructure (two rows, header search bar, cart trigger)

**Files:**
- Create: `components/cart/CartDrawer.tsx`
- Create: `components/layout/HeaderSearchBar.tsx`
- Modify: `components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: `useCartStore` (`isCartOpen`, `closeCart`, `openCart`, `items`, `totalItems`, `totalPrice`, `removeItem`, `updateQuantity` — all from Task 1), `searchProducts` (Task 2)

- [ ] **Step 1: Create `components/cart/CartDrawer.tsx`**

```tsx
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

export default function CartDrawer() {
  const { items, totalItems, totalPrice, isCartOpen, closeCart, removeItem, updateQuantity } = useCartStore()

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} />
      <aside
        className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-black text-lg">Carrello ({totalItems})</h2>
          <button onClick={closeCart} className="p-1 text-gray-400 hover:text-black transition-colors">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <ShoppingBag size={48} className="text-gray-200 mb-4" />
            <p className="font-bold mb-1">Il carrello è vuoto</p>
            <p className="text-sm text-gray-400 mb-6">Aggiungi qualcosa di bello per i tuoi cavalli.</p>
            <button onClick={closeCart} className="text-red font-semibold text-sm hover:text-red-dark">
              Continua lo shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-light shrink-0">
                    <Image src={item.product.images[0] ?? ''} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold line-clamp-2">{item.product.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatPrice(item.product.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden text-xs">
                        <button
                          onClick={() => item.quantity > 1 ? updateQuantity(item.product.id, item.quantity - 1) : removeItem(item.product.id)}
                          className="px-2 py-1 hover:bg-gray-light"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="px-2 font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-gray-light"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.product.id)} className="text-gray-300 hover:text-red transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-black shrink-0">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="px-6 py-5 border-t border-gray-100">
              <div className="flex justify-between font-black text-lg mb-4">
                <span>Subtotale</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full text-center border-2 border-black py-3 rounded-full font-bold text-sm hover:bg-black hover:text-white transition-colors"
                >
                  Vai al carrello
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full text-center bg-red text-white py-3 rounded-full font-bold text-sm hover:bg-red-dark transition-colors"
                >
                  Vai al checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/layout/HeaderSearchBar.tsx`**

```tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'
import allProducts from '@/data/products.json'
import type { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { searchProducts } from '@/lib/search'

const products = allProducts as Product[]

export default function HeaderSearchBar() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const results = searchProducts(products, query)

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md mx-6 hidden md:block">
      <div className="flex items-center gap-2 bg-gray-light rounded-full px-4 py-2">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Cerca un prodotto..."
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      {open && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl overflow-hidden max-h-[60vh] overflow-y-auto z-50">
          {results.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-gray-400">
              Nessun prodotto trovato per &quot;{query}&quot;
            </p>
          ) : (
            results.map(p => (
              <Link
                key={p.id}
                href={`/prodotto/${p.slug}`}
                onClick={() => { setOpen(false); setQuery('') }}
                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-light transition-colors"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-light shrink-0">
                  <Image src={p.images[0] ?? ''} alt={p.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.category}</p>
                </div>
                <p className="text-sm font-bold text-black shrink-0">{formatPrice(p.price)}</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Rewrite `components/layout/Navbar.tsx`**

```tsx
'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Search, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import categoriesData from '@/data/categories.json'
import brandsData from '@/data/brands.json'
import type { Category, Brand } from '@/lib/types'
import { getChildren } from '@/lib/category-tree'
import { BRANCH_IMAGES } from '@/lib/branch-images'
import HeaderSearchBar from './HeaderSearchBar'
import CartDrawer from '@/components/cart/CartDrawer'

const SearchOverlay = dynamic(() => import('./SearchOverlay'), { ssr: false })

const categories = categoriesData as Category[]
const brands = brandsData as Brand[]
const topLevel = getChildren(categories, undefined)
const topBrands = [...brands].sort((a, b) => b.productCount - a.productCount).slice(0, 12)

const GUIDE_LINKS = [
  { label: 'Cura del cavallo', href: '/shop/scuderia/cura-del-cavallo' },
  { label: 'Cura del cuoio', href: '/shop/scuderia/cura-del-cuoio' },
  { label: 'Attrezzatura da scuderia', href: '/shop/scuderia/attrezzatura-da-scuderia' },
  { label: 'Selle e accessori (Inglese)', href: '/shop/monta-inglese/cavallo/selle-e-accessori' },
  { label: 'Coperte', href: '/shop/monta-inglese/cavallo/coperte' },
  { label: 'Protezioni', href: '/shop/monta-inglese/cavallo/protezioni' },
  { label: 'Selle e accessori (Western)', href: '/shop/monta-western/cavallo/selle-e-accessori' },
  { label: 'Briglie e accessori', href: '/shop/monta-inglese/cavallo/briglie-e-accessori' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { totalItems, openCart } = useCartStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-8 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex-shrink-0 relative h-10 w-[93px]">
            <Image src="/logo-selleria-galazzo.png" alt="Selleria Galazzo" fill className="object-contain object-left" priority />
          </Link>

          <HeaderSearchBar />

          <div className="flex items-center gap-4">
            <button className="p-2 hover:text-red transition-colors md:hidden" onClick={() => setSearchOpen(true)}>
              <Search size={20} />
            </button>
            <button className="p-2 hover:text-red transition-colors">
              <Heart size={20} />
            </button>
            <button className="relative p-2 hover:text-red transition-colors" onClick={openCart}>
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 h-12 border-t border-gray-100">
          {topLevel.map(cat => (
            <div key={cat.slug.join('/')} className="group relative">
              <Link
                href={`/shop/${cat.slug.join('/')}`}
                className="text-sm font-medium text-black hover:text-red transition-colors h-12 inline-flex items-center"
              >
                {cat.name}
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:flex bg-white shadow-lg rounded-xl p-6 gap-8 z-50 w-max max-w-3xl">
                <div className="flex gap-8">
                  {getChildren(categories, cat).map(mid => (
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
                  className="relative w-48 shrink-0 rounded-xl overflow-hidden group/promo"
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

          <div className="group relative">
            <Link href="/marche" className="text-sm font-medium text-black hover:text-red transition-colors h-12 inline-flex items-center">
              Marche
            </Link>
            <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:block bg-white shadow-lg rounded-xl p-6 z-50 w-[420px]">
              <div className="grid grid-cols-4 gap-4">
                {topBrands.map(brand => (
                  <Link
                    key={brand.id}
                    href={`/brand/${brand.id}`}
                    className="flex flex-col items-center gap-2 text-center group/brand"
                  >
                    {brand.logo ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-light">
                        <Image src={brand.logo} alt={brand.name} fill className="object-contain p-1" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-light flex items-center justify-center text-xs font-black text-gray-400">
                        {brand.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs text-black group-hover/brand:text-red transition-colors leading-tight">{brand.name}</span>
                  </Link>
                ))}
              </div>
              <Link href="/marche" className="block text-center text-sm font-semibold text-red mt-4 hover:text-red-dark">
                Vedi tutti i marchi →
              </Link>
            </div>
          </div>

          <Link href="/offerte" className="text-sm font-medium text-red hover:text-red-dark transition-colors h-12 inline-flex items-center">
            Offerte
          </Link>

          <div className="group relative">
            <span className="text-sm font-medium text-black h-12 inline-flex items-center cursor-default">
              Guida ai prodotti
            </span>
            <div className="absolute right-0 top-full hidden group-hover:block bg-white shadow-lg rounded-xl p-6 z-50 w-64">
              <div className="flex flex-col gap-2">
                {GUIDE_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-black hover:text-red transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            {topLevel.map(cat => (
              <Link
                key={cat.slug.join('/')}
                href={`/shop/${cat.slug.join('/')}`}
                className="block py-3 text-sm font-medium text-black hover:text-red"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <Link href="/marche" className="block py-3 text-sm font-medium text-black hover:text-red" onClick={() => setMobileOpen(false)}>
              Marche
            </Link>
            <Link href="/offerte" className="block py-3 text-sm font-medium text-red hover:text-red-dark" onClick={() => setMobileOpen(false)}>
              Offerte
            </Link>
          </div>
        )}
      </div>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      <CartDrawer />
    </nav>
  )
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 5: Verify with the dev server**

Run: `npm run dev` (in background), then:

```bash
curl -s http://localhost:3000/ | grep -o 'Cerca un prodotto' | head -1
```

Expected: prints `Cerca un prodotto` (confirms the new header search bar's placeholder is in the markup). Stop the dev server after checking.

- [ ] **Step 6: Commit**

```bash
git add components/cart/CartDrawer.tsx components/layout/HeaderSearchBar.tsx components/layout/Navbar.tsx
git commit -m "feat: cart drawer + two-row navbar with always-visible search"
```

---

### Task 5: Reviews + cart-drawer trigger on ProductCard

**Files:**
- Modify: `components/shop/ProductCard.tsx`

**Interfaces:**
- Consumes: `getReviewSummary` (Task 3), `openCart` from `useCartStore` (Task 1)

- [ ] **Step 1: Rewrite `components/shop/ProductCard.tsx`**

```tsx
'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { getReviewSummary } from '@/lib/reviews'
import type { Product } from '@/lib/types'

interface ProductCardProps { product: Product }

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCartStore()
  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null
  const { rating, count } = getReviewSummary(product.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <Link href={`/prodotto/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-light">
        <Image
          src={product.images[0] ?? ''}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discountPct && (
          <span className="absolute top-3 left-3 bg-red text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPct}%
          </span>
        )}
        <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:text-red">
          <Heart size={16} />
        </button>
        {/* Quick add */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={e => { e.preventDefault(); addItem(product, 1); openCart() }}
            className="w-full bg-red text-white py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-dark transition-colors"
          >
            <ShoppingCart size={16} />
            Aggiungi al carrello
          </button>
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs text-sand font-semibold uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="font-semibold text-sm text-black leading-tight mb-1 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="fill-sand text-sand" />
          <span className="text-xs font-semibold text-gray-600">{rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({count})</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-black text-black">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-gray-400 text-sm line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 3: Run the full suite**

Run: `npm test`
Expected: PASS (no test covers this component directly, confirms no regressions)

- [ ] **Step 4: Commit**

```bash
git add components/shop/ProductCard.tsx
git commit -m "feat: review stars and cart-drawer trigger on ProductCard"
```

---

### Task 6: Reviews + Klarna badge + cart-drawer trigger on ProductInfo

**Files:**
- Modify: `components/product/ProductInfo.tsx`

**Interfaces:**
- Consumes: `getReviewSummary` (Task 3), `openCart` from `useCartStore` (Task 1)

- [ ] **Step 1: Rewrite `components/product/ProductInfo.tsx`**

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Heart, Minus, Plus, ShoppingCart, Star } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { findCategoryByPath } from '@/lib/category-tree'
import { getReviewSummary } from '@/lib/reviews'
import categoriesData from '@/data/categories.json'
import type { Product, Category } from '@/lib/types'

const categories = categoriesData as Category[]

interface ProductInfoProps { product: Product }

export default function ProductInfo({ product }: ProductInfoProps) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem, openCart } = useCartStore()
  const breadcrumbSlug = findCategoryByPath(categories, product.categoryPath)?.slug ?? []
  const { rating, count } = getReviewSummary(product.id)

  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  const handleAdd = () => {
    addItem(product, qty)
    openCart()
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <nav className="text-sand font-bold uppercase text-xs tracking-widest mb-2 flex flex-wrap items-center gap-1">
          {product.categoryPath.map((segment, i) => (
            <span key={segment} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-300">/</span>}
              {breadcrumbSlug.length > 0 ? (
                <Link href={`/shop/${breadcrumbSlug.slice(0, i + 1).join('/')}`} className="hover:text-red transition-colors">
                  {segment}
                </Link>
              ) : (
                <span>{segment}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="text-3xl lg:text-4xl font-black text-black leading-tight">{product.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} size={16} className={i < Math.round(rating) ? 'fill-sand text-sand' : 'text-gray-200'} />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-600">{rating.toFixed(1)}</span>
          <span className="text-sm text-gray-400">({count} recensioni)</span>
        </div>
        {product.brand && <p className="text-gray-400 text-sm mt-1">{product.brand}</p>}
      </div>

      <div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <>
              <span className="text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
              <span className="bg-red text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discountPct}%</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
          <span className="bg-[#FFB3C7] text-black font-black text-[10px] px-1.5 py-0.5 rounded">Klarna</span>
          <span>Paga in 3 rate da {formatPrice(Math.round(product.price / 3))} senza interessi</span>
        </div>
      </div>

      {/* Qty */}
      <div>
        <p className="text-sm font-semibold mb-3">Quantità</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center border-2 border-gray-200 rounded-full overflow-hidden">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-4 py-2 hover:bg-gray-light transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="px-4 font-bold">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="px-4 py-2 hover:bg-gray-light transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleAdd}
          className={`w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-colors ${
            added ? 'bg-green-600 text-white' : 'bg-red text-white hover:bg-red-dark'
          }`}
        >
          <ShoppingCart size={20} />
          {added ? 'Aggiunto al carrello ✓' : 'Aggiungi al carrello'}
        </button>
        <button className="w-full py-4 rounded-full font-bold border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2">
          <Heart size={20} />
          Aggiungi alla wishlist
        </button>
      </div>

      {/* Trust mini */}
      <div className="border-t border-gray-100 pt-4 grid grid-cols-3 gap-2 text-center text-xs text-gray-400">
        <div>🚚 Spedizione gratuita<br/>sopra €80</div>
        <div>↩️ Reso gratuito<br/>30 giorni</div>
        <div>🔒 Pagamento<br/>sicuro</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 3: Verify with the dev server**

Run: `npm run dev` (in background), then:

```bash
curl -s http://localhost:3000/prodotto/acavallo-sapone-per-il-cuoio-alla-mandorla-500ml-glicerina | grep -o "Klarna" | head -1
```

Expected: prints `Klarna`. Stop the dev server after checking.

- [ ] **Step 4: Commit**

```bash
git add components/product/ProductInfo.tsx
git commit -m "feat: review stars, Klarna badge, cart-drawer trigger on ProductInfo"
```

---

### Task 7: Recensioni tab on ProductTabs

**Files:**
- Modify: `components/product/ProductTabs.tsx`
- Modify: `app/prodotto/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getReviewSummary` (Task 3)
- Produces: `ProductTabsProps` gains `productId: string`

- [ ] **Step 1: Rewrite `components/product/ProductTabs.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { Star } from 'lucide-react'
import { splitBulletedText } from '@/lib/feed-transform'
import { getReviewSummary } from '@/lib/reviews'

interface ProductTabsProps { description: string; specs: string; productId: string }

const TABS = ['Descrizione', 'Specifiche', 'Recensioni', 'Spedizione & Resi'] as const

export default function ProductTabs({ description, specs, productId }: ProductTabsProps) {
  const [active, setActive] = useState<typeof TABS[number]>('Descrizione')
  const { intro, items: bulletItems } = splitBulletedText(description)
  const { rating, count, reviews } = getReviewSummary(productId)

  const content: Record<typeof TABS[number], React.ReactNode> = {
    'Descrizione': description ? (
      <div className="space-y-4">
        {intro && <p className="text-gray-600 leading-relaxed">{intro}</p>}
        {bulletItems.length > 0 && (
          <ul className="space-y-2 list-disc list-inside text-sm text-gray-600">
            {bulletItems.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        )}
      </div>
    ) : (
      <p className="text-gray-400">Descrizione non disponibile.</p>
    ),
    'Specifiche': specs ? (
      <ul className="space-y-2 list-disc list-inside text-sm text-gray-600">
        {specs.split(' | ').map(item => <li key={item}>{item}</li>)}
      </ul>
    ) : (
      <p className="text-sm text-gray-400">Nessuna specifica tecnica disponibile per questo prodotto.</p>
    ),
    'Recensioni': (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} size={18} className={i < Math.round(rating) ? 'fill-sand text-sand' : 'text-gray-200'} />
            ))}
          </div>
          <span className="font-black text-lg">{rating.toFixed(1)}</span>
          <span className="text-sm text-gray-400">su {count} recensioni</span>
        </div>
        <div className="space-y-5">
          {reviews.map((review, i) => (
            <div key={i} className="border-b border-gray-100 pb-5 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm">{review.author}</p>
                <p className="text-xs text-gray-400">{review.date}</p>
              </div>
              <div className="flex items-center gap-0.5 mb-2">
                {Array.from({ length: 5 }, (_, i2) => (
                  <Star key={i2} size={12} className={i2 < Math.round(review.rating) ? 'fill-sand text-sand' : 'text-gray-200'} />
                ))}
              </div>
              <p className="text-sm text-gray-600">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    'Spedizione & Resi': (
      <div className="space-y-4 text-sm text-gray-600">
        <p>🚚 <strong>Spedizione standard:</strong> 3-5 giorni lavorativi. Gratuita sopra €80, altrimenti €5,90.</p>
        <p>⚡ <strong>Spedizione express:</strong> 1-2 giorni lavorativi. €9,90.</p>
        <p>↩️ <strong>Resi:</strong> Gratuiti entro 30 giorni dall&apos;acquisto. Prodotto integro e imballato.</p>
      </div>
    ),
  }

  return (
    <div className="mt-12">
      <div className="flex gap-0 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              active === tab ? 'border-red text-red' : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            {tab === 'Recensioni' ? `Recensioni (${count})` : tab}
          </button>
        ))}
      </div>
      <div className="py-6">{content[active]}</div>
    </div>
  )
}
```

- [ ] **Step 2: Pass `productId` from `app/prodotto/[slug]/page.tsx`**

Change:

```tsx
      <ProductTabs description={product.description} specs={product.specs} />
```

to:

```tsx
      <ProductTabs description={product.description} specs={product.specs} productId={product.id} />
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 4: Verify with the dev server**

Run: `npm run dev` (in background), then:

```bash
curl -s http://localhost:3000/prodotto/acavallo-sapone-per-il-cuoio-alla-mandorla-500ml-glicerina | grep -o "Recensioni ([0-9]*)" | head -1
```

Expected: prints something like `Recensioni (73)` (exact number varies by product id). Stop the dev server after checking.

- [ ] **Step 5: Commit**

```bash
git add components/product/ProductTabs.tsx app/prodotto/\[slug\]/page.tsx
git commit -m "feat: add Recensioni tab to product pages"
```

---

### Task 8: Homepage trust stat

**Files:**
- Modify: `components/home/HeroSection.tsx`

- [ ] **Step 1: Add a 4th stat to the Hero's stats row**

Change:

```tsx
            <div className="flex gap-8 mt-12 text-sm">
              <div>
                <div className="font-black text-2xl">10k+</div>
                <div className="text-gray-400">Cavalieri</div>
              </div>
              <div>
                <div className="font-black text-2xl">200+</div>
                <div className="text-gray-400">Brand selezionati</div>
              </div>
              <div>
                <div className="font-black text-2xl">40+</div>
                <div className="text-gray-400">Anni di esperienza</div>
              </div>
            </div>
```

to:

```tsx
            <div className="flex flex-wrap gap-8 mt-12 text-sm">
              <div>
                <div className="font-black text-2xl">10k+</div>
                <div className="text-gray-400">Cavalieri</div>
              </div>
              <div>
                <div className="font-black text-2xl">200+</div>
                <div className="text-gray-400">Brand selezionati</div>
              </div>
              <div>
                <div className="font-black text-2xl">40+</div>
                <div className="text-gray-400">Anni di esperienza</div>
              </div>
              <div>
                <div className="font-black text-2xl">4.8★</div>
                <div className="text-gray-400">Recensioni verificate</div>
              </div>
            </div>
```

(Note: `flex gap-8` becomes `flex flex-wrap gap-8` so the 4th stat wraps gracefully on narrow screens instead of overflowing.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 3: Commit**

```bash
git add components/home/HeroSection.tsx
git commit -m "feat: add reviews trust stat to homepage hero"
```

---

### Task 9: Payment methods at checkout

**Files:**
- Modify: `app/checkout/page.tsx`

- [ ] **Step 1: Add payment-method state**

Change:

```tsx
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState({ email: '', nome: '', cognome: '', indirizzo: '', cap: '', citta: '', shipping: 'standard' })
```

to:

```tsx
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState({ email: '', nome: '', cognome: '', indirizzo: '', cap: '', citta: '', shipping: 'standard' })
  const [payment, setPayment] = useState('card')
```

- [ ] **Step 2: Replace the step-3 block**

Change:

```tsx
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black">Pagamento</h2>
              <div className="bg-gray-light rounded-xl p-4 text-xs text-gray-400 flex items-center gap-2">
                🔒 Connessione sicura — I tuoi dati sono protetti con crittografia SSL
              </div>
              <input placeholder="Numero carta *" className={inputClass} maxLength={19} />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Scadenza MM/AA *" className={inputClass} />
                <input placeholder="CVV *" className={inputClass} maxLength={4} />
              </div>
              <input placeholder="Nome sulla carta *" className={inputClass} />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="flex-1 border-2 border-black py-4 rounded-full font-bold hover:bg-black hover:text-white transition-colors">
                  ← Indietro
                </button>
                <button
                  onClick={() => { clearCart(); router.push('/checkout/success') }}
                  className="flex-1 bg-red text-white py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
                >
                  Conferma ordine
                </button>
              </div>
            </div>
          )}
```

to:

```tsx
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black">Pagamento</h2>
              <div className="bg-gray-light rounded-xl p-4 text-xs text-gray-400 flex items-center gap-2">
                🔒 Connessione sicura — I tuoi dati sono protetti con crittografia SSL
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'card', label: 'Carta di credito/debito' },
                  { id: 'paypal', label: 'PayPal' },
                  { id: 'klarna', label: 'Klarna — Paga a rate' },
                  { id: 'bonifico', label: 'Bonifico bancario' },
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      payment === opt.id ? 'border-red bg-red/5' : 'border-gray-200 hover:border-sand'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.id}
                      checked={payment === opt.id}
                      onChange={() => setPayment(opt.id)}
                      className="accent-red"
                    />
                    <span className="font-semibold text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>

              {payment === 'card' && (
                <>
                  <input placeholder="Numero carta *" className={inputClass} maxLength={19} />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Scadenza MM/AA *" className={inputClass} />
                    <input placeholder="CVV *" className={inputClass} maxLength={4} />
                  </div>
                  <input placeholder="Nome sulla carta *" className={inputClass} />
                </>
              )}
              {payment === 'paypal' && (
                <p className="text-sm text-gray-600 bg-gray-light rounded-xl p-4">
                  Verrai reindirizzato a PayPal per completare il pagamento in sicurezza.
                </p>
              )}
              {payment === 'klarna' && (
                <p className="text-sm text-gray-600 bg-gray-light rounded-xl p-4">
                  Paga in 3 rate senza interessi o tra 30 giorni con Klarna. Verrai reindirizzato a Klarna per completare l&apos;acquisto.
                </p>
              )}
              {payment === 'bonifico' && (
                <p className="text-sm text-gray-600 bg-gray-light rounded-xl p-4">
                  Riceverai le coordinate bancarie via email per completare il bonifico. L&apos;ordine sarà spedito alla ricezione del pagamento.
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="flex-1 border-2 border-black py-4 rounded-full font-bold hover:bg-black hover:text-white transition-colors">
                  ← Indietro
                </button>
                <button
                  onClick={() => { clearCart(); router.push('/checkout/success') }}
                  className="flex-1 bg-red text-white py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
                >
                  Conferma ordine
                </button>
              </div>
            </div>
          )}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 4: Verify with the dev server**

Run: `npm run dev` (in background), then:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/checkout
```

Expected: `200`. Note: the payment-method selector only renders once a user has clicked through to step 3 (`step === 3` is client-side React state, not a URL — there's nothing for `curl` to inspect there), so this step only confirms the page itself still loads. The actual selector behavior is verified interactively in Task 10's browser pass. Stop the dev server after checking.

- [ ] **Step 5: Commit**

```bash
git add app/checkout/page.tsx
git commit -m "feat: add PayPal/Klarna/bank-transfer payment options to checkout"
```

---

### Task 10: Full build + test + manual verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS, all suites green (store, search, reviews, category-tree, offers, feed-transform, utils)

- [ ] **Step 2: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: zero TypeScript errors; build succeeds; page count unchanged from before this plan (~3263 — this plan adds no new routes)

- [ ] **Step 3: Manual smoke test with the production build**

Run: `npm run start` (in background), then:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/prodotto/acavallo-sapone-per-il-cuoio-alla-mandorla-500ml-glicerina
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/checkout
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/cart
```

Expected: `200` for every route. Stop the server after checking.

- [ ] **Step 4: Browser check of the golden path**

Using interactive browser tooling, confirm: the header search bar is visible without clicking anything on desktop widths, typing shows a live dropdown of real results, clicking a result navigates to that product; clicking "Aggiungi al carrello" on a product card or product page opens the slide-in cart drawer from the right with the item in it; the drawer's "Vai al checkout" link works; on `/checkout` step 3, selecting each payment method swaps the visible content correctly and the order still completes via "Conferma ordine"; a product page shows star ratings under the title and in a card grid, and a working "Recensioni (N)" tab with sample reviews; the Klarna badge appears under the price; the homepage hero shows the 4th "4.8★ Recensioni verificate" stat.

- [ ] **Step 5: Final commit (if any fixups were needed)**

```bash
git add -A
git commit -m "fix: address issues found during full verification"
```

(Skip this step if Steps 1-4 all passed cleanly with no changes needed.)
