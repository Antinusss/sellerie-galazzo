# CRO Checklist Batch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the applicable, not-yet-built items from the client's CRO checklist: a real wishlist, deterministic product badges, cart/footer trust polish, a branded 404 page, a cookie banner, checkout input polish, a home "best sellers" section, and a distraction-free checkout layout.

**Architecture:** Two new pure/state modules (`lib/wishlist-store.ts`, `lib/badges.ts`) follow the exact patterns already established by `lib/store.ts` and `lib/offers.ts`/`lib/reviews.ts`. Every other task is a small, self-contained edit to an existing component or a new leaf component, following the codebase's existing conventions (Tailwind utility classes already in use, Italian copy, `'use client'` only where interactivity requires it).

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Zustand + `persist` middleware, Lucide React icons, Jest + `@testing-library/react`.

## Global Constraints

- Badge/wishlist logic must be deterministic (hashed from `product.id`), never `Math.random()`/`Date.now()` — same rule already applied in `lib/offers.ts` and `lib/reviews.ts`.
- No fabricated urgency/social-proof counters ("X people viewing", "X shipped this month") — explicitly out of scope per the design spec.
- Wishlist and cookie-consent state persist via `localStorage` only (no backend) — same as the existing cart store.
- All new user-facing copy is Italian, matching the site's existing tone.
- Reuse existing Tailwind color utilities only: `bg-red`, `hover:bg-red-dark`, `text-red`, `bg-sand`, `text-sand`, `bg-gray-light`, `text-gray-400`, etc. — no new colors.
- Do not touch `/shop`, `/prodotto`, `/brand`, `/marche`, `/offerte` page structure beyond adding the badge pill and wishlist button to `ProductCard`/`ProductInfo`.
- Component-level changes in this codebase are not unit-tested (established convention — only `lib/` pure modules have Jest tests); verify component tasks via `npm run build` + manual/browser checks instead of RTL tests.

---

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

---

### Task 2: Product badge data layer

**Files:**
- Create: `lib/badges.ts`
- Test: `__tests__/badges.test.ts`

**Interfaces:**
- Consumes: `getReviewSummary(productId: string): ReviewSummary` from `lib/reviews.ts` (existing, produces `{ rating, count, reviews }`).
- Produces: `getBadge(productId: string): 'novita' | 'bestseller' | null`, imported by Task 4 (`ProductCard`).

- [ ] **Step 1: Write the failing test**

Create `__tests__/badges.test.ts`:

```ts
import { getBadge } from '@/lib/badges'

describe('getBadge', () => {
  it('is deterministic for the same product id', () => {
    expect(getBadge('67217')).toBe(getBadge('67217'))
  })

  it('returns "bestseller" for a product with a high review count', () => {
    // id=108 -> reviewCount = 3 + (108 % 118) = 111, above the 110 threshold
    expect(getBadge('108')).toBe('bestseller')
  })

  it('returns "novita" for a product whose id is a multiple of 12 and not a bestseller', () => {
    // id=12 -> reviewCount = 3 + (12 % 118) = 15 (below threshold), 12 % 12 === 0
    expect(getBadge('12')).toBe('novita')
  })

  it('returns null for a product matching neither rule', () => {
    // id=1 -> reviewCount = 4 (below threshold), 1 % 12 !== 0
    expect(getBadge('1')).toBeNull()
  })

  it('never returns both — every id yields exactly one of the three values', () => {
    for (let id = 0; id < 300; id++) {
      expect(['novita', 'bestseller', null]).toContain(getBadge(String(id)))
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/badges.test.ts`
Expected: FAIL with `Cannot find module '@/lib/badges'`

- [ ] **Step 3: Write minimal implementation**

Create `lib/badges.ts`:

```ts
import { getReviewSummary } from './reviews'

export type Badge = 'novita' | 'bestseller' | null

const NOVITA_MODULO = 12
const BESTSELLER_COUNT_THRESHOLD = 110

function hashOf(id: string): number {
  const n = Number(id)
  return Number.isFinite(n) ? n : id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0)
}

export function getBadge(productId: string): Badge {
  const { count } = getReviewSummary(productId)
  if (count > BESTSELLER_COUNT_THRESHOLD) return 'bestseller'

  if (hashOf(productId) % NOVITA_MODULO === 0) return 'novita'

  return null
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/badges.test.ts`
Expected: PASS, 5/5 tests

- [ ] **Step 5: Commit**

```bash
git add lib/badges.ts __tests__/badges.test.ts
git commit -m "feat: add deterministic product badge module"
```

---

### Task 3: Wishlist page and Navbar entry point

**Files:**
- Create: `app/wishlist/page.tsx`
- Modify: `components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: `useWishlistStore()` from Task 1 (`lib/wishlist-store.ts`).
- Consumes: `PaginatedProductGrid({ products: Product[] })` (existing, `components/shop/PaginatedProductGrid.tsx`).

- [ ] **Step 1: Create the wishlist page**

Create `app/wishlist/page.tsx`:

```tsx
'use client'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import allProducts from '@/data/products.json'
import type { Product } from '@/lib/types'
import { useWishlistStore } from '@/lib/wishlist-store'
import PaginatedProductGrid from '@/components/shop/PaginatedProductGrid'

const products = allProducts as Product[]

export default function WishlistPage() {
  const { productIds } = useWishlistStore()
  const wishlisted = products.filter(p => productIds.includes(p.id))

  if (wishlisted.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Heart size={64} className="mx-auto text-gray-200 mb-6" />
        <h1 className="text-3xl font-black mb-3">La tua wishlist è vuota</h1>
        <p className="text-gray-400 mb-8">Salva i prodotti che ti piacciono per ritrovarli facilmente.</p>
        <Link
          href="/shop"
          className="inline-block bg-red text-white px-8 py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
        >
          Vai allo shop
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-black mb-2">
        La tua <em className="text-red">wishlist</em>
      </h1>
      <p className="text-sm text-gray-400 mb-8">{wishlisted.length} prodotti salvati</p>
      <PaginatedProductGrid products={wishlisted} />
    </div>
  )
}
```

- [ ] **Step 2: Wire the Navbar heart icon to the wishlist**

In `components/layout/Navbar.tsx`, add the import (near the other `lib/` imports):

```tsx
import { useWishlistStore } from '@/lib/wishlist-store'
```

Inside the `Navbar` component body, alongside the existing `const { totalItems, openCart } = useCartStore()` line, add:

```tsx
const { productIds: wishlistIds } = useWishlistStore()
```

Replace this block:

```tsx
            <button className="p-2 hover:text-red transition-colors">
              <Heart size={20} />
            </button>
```

with:

```tsx
            <Link href="/wishlist" className="relative p-2 hover:text-red transition-colors">
              <Heart size={20} />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
```

(`Link` is already imported in this file.)

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, new static route `○ /wishlist` appears in the route list

- [ ] **Step 4: Commit**

```bash
git add app/wishlist/page.tsx components/layout/Navbar.tsx
git commit -m "feat: add wishlist page and navbar entry point"
```

---

### Task 4: ProductCard wishlist toggle and badge pill

**Files:**
- Modify: `components/shop/ProductCard.tsx`

**Interfaces:**
- Consumes: `useWishlistStore()` from Task 1, `getBadge(productId: string)` from Task 2.

- [ ] **Step 1: Add imports and hooks**

In `components/shop/ProductCard.tsx`, add these imports alongside the existing ones:

```tsx
import { useWishlistStore } from '@/lib/wishlist-store'
import { getBadge } from '@/lib/badges'
```

Inside the component, alongside the existing `const { addItem, openCart } = useCartStore()` line, add:

```tsx
  const { toggleWishlist, isWishlisted } = useWishlistStore()
  const wishlisted = isWishlisted(product.id)
  const badge = getBadge(product.id)
```

- [ ] **Step 2: Replace the discount-badge span with a stacked badge column**

Replace:

```tsx
        {discountPct && (
          <span className="absolute top-3 left-3 bg-red text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPct}%
          </span>
        )}
```

with:

```tsx
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {discountPct && (
            <span className="bg-red text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discountPct}%
            </span>
          )}
          {badge === 'bestseller' && (
            <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full">Bestseller</span>
          )}
          {badge === 'novita' && (
            <span className="bg-sand text-black text-xs font-bold px-2 py-1 rounded-full">Novità</span>
          )}
        </div>
```

- [ ] **Step 3: Wire the heart button to the wishlist toggle**

Replace:

```tsx
        <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:text-red">
          <Heart size={16} />
        </button>
```

with:

```tsx
        <button
          onClick={e => { e.preventDefault(); toggleWishlist(product.id) }}
          className={`absolute top-3 right-3 p-2 bg-white/90 rounded-full transition-opacity hover:text-red ${
            wishlisted ? 'opacity-100 text-red' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart size={16} className={wishlisted ? 'fill-red' : ''} />
        </button>
```

- [ ] **Step 4: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds (no route count change — `ProductCard` is used across existing routes)

- [ ] **Step 5: Commit**

```bash
git add components/shop/ProductCard.tsx
git commit -m "feat: wire wishlist toggle and badges into ProductCard"
```

---

### Task 5: ProductInfo wishlist toggle

**Files:**
- Modify: `components/product/ProductInfo.tsx`

**Interfaces:**
- Consumes: `useWishlistStore()` from Task 1.

- [ ] **Step 1: Add import and hook**

Add to the existing imports:

```tsx
import { useWishlistStore } from '@/lib/wishlist-store'
```

Inside the component, alongside the existing `const { addItem, openCart } = useCartStore()` line, add:

```tsx
  const { toggleWishlist, isWishlisted } = useWishlistStore()
  const wishlisted = isWishlisted(product.id)
```

- [ ] **Step 2: Wire the wishlist button**

Replace:

```tsx
        <button className="w-full py-4 rounded-full font-bold border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2">
          <Heart size={20} />
          Aggiungi alla wishlist
        </button>
```

with:

```tsx
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`w-full py-4 rounded-full font-bold border-2 flex items-center justify-center gap-2 transition-colors ${
            wishlisted ? 'border-red bg-red/5 text-red' : 'border-black hover:bg-black hover:text-white'
          }`}
        >
          <Heart size={20} className={wishlisted ? 'fill-red' : ''} />
          {wishlisted ? 'Nella tua wishlist ✓' : 'Aggiungi alla wishlist'}
        </button>
```

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, all `/prodotto/[slug]` pages still generate (3066 paths)

- [ ] **Step 4: Commit**

```bash
git add components/product/ProductInfo.tsx
git commit -m "feat: wire wishlist toggle into ProductInfo"
```

---

### Task 6: Cart and footer trust polish

**Files:**
- Modify: `components/cart/CartDrawer.tsx`
- Modify: `app/cart/page.tsx`
- Modify: `components/layout/Footer.tsx`

**Interfaces:**
- None new — pure UI additions to existing components using data already available in each (`useCartStore`, `formatPrice`).

- [ ] **Step 1: Add free-shipping progress message to CartDrawer**

In `components/cart/CartDrawer.tsx`, insert this block immediately before the `<div className="flex justify-between font-black text-lg mb-4">` subtotal row (both are inside the `<div className="px-6 py-5 border-t border-gray-100">` footer block):

```tsx
              {totalPrice < 8000 && (
                <p className="text-xs text-gray-400 mb-3">
                  Aggiungi {formatPrice(8000 - totalPrice)} per la spedizione gratuita
                </p>
              )}
```

(`totalPrice` and `formatPrice` are already destructured/imported in this file.)

- [ ] **Step 2: Add "Continua lo shopping" link to the populated cart page**

In `app/cart/page.tsx`, replace:

```tsx
      <h1 className="text-4xl font-black mb-10">
        Il tuo <em className="text-red">carrello</em>
      </h1>
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1">
          {items.map(item => <CartItem key={item.product.id} item={item} />)}
        </div>
```

with:

```tsx
      <h1 className="text-4xl font-black mb-6">
        Il tuo <em className="text-red">carrello</em>
      </h1>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{items.length} {items.length === 1 ? 'articolo' : 'articoli'}</p>
        <Link href="/shop" className="text-sm font-semibold text-red hover:text-red-dark transition-colors">
          ← Continua lo shopping
        </Link>
      </div>
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1">
          {items.map(item => <CartItem key={item.product.id} item={item} />)}
        </div>
```

(`Link` is already imported in this file.)

- [ ] **Step 3: Add "Torna su" link to the Footer**

`components/layout/Footer.tsx` currently has no `'use client'` directive. Add it as the first line of the file (before the imports):

```tsx
'use client'
```

Then, inside the bottom bar, replace:

```tsx
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 Selleria Galazzo di Biag Galazzo. Tutti i diritti riservati.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white transition-colors">P.IVA 00000000000</a>
          </div>
        </div>
```

with:

```tsx
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 Selleria Galazzo di Biag Galazzo. Tutti i diritti riservati.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white transition-colors">P.IVA 00000000000</a>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-white transition-colors"
            >
              ↑ Torna su
            </button>
          </div>
        </div>
```

- [ ] **Step 4: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 5: Commit**

```bash
git add components/cart/CartDrawer.tsx app/cart/page.tsx components/layout/Footer.tsx
git commit -m "feat: add free-shipping progress, continue-shopping link, and back-to-top"
```

---

### Task 7: Branded 404 page

**Files:**
- Create: `app/not-found.tsx`

**Interfaces:**
- None — standalone Next.js special file, no props.

- [ ] **Step 1: Create the 404 page**

Create `app/not-found.tsx`:

```tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <p className="text-sand font-black text-sm uppercase tracking-widest mb-4">Errore 404</p>
      <h1 className="text-4xl md:text-5xl font-black mb-4">
        Pagina <em className="text-red">non trovata</em>
      </h1>
      <p className="text-gray-400 mb-10">
        La pagina che cerchi non esiste più o è stata spostata. Torna allo shop per continuare
        a curiosare tra i nostri prodotti.
      </p>
      <Link
        href="/shop"
        className="inline-block bg-red text-white px-8 py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
      >
        Vai allo shop
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, `/_not-found` route present in output (already listed today as a default Next.js route — this replaces its content, not its path)

- [ ] **Step 3: Commit**

```bash
git add app/not-found.tsx
git commit -m "feat: add branded 404 page"
```

---

### Task 8: Cookie consent banner

**Files:**
- Create: `components/layout/CookieBanner.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- None new — standalone component, no props.

- [ ] **Step 1: Create the cookie banner**

Create `components/layout/CookieBanner.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'selleria-galazzo-cookie-consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  const dismiss = (choice: 'accepted' | 'rejected') => {
    localStorage.setItem(STORAGE_KEY, choice)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-black text-white px-4 py-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4 justify-between">
        <p className="text-sm text-gray-300">
          Usiamo cookie tecnici necessari al funzionamento del sito. Nessun dato viene condiviso con terze parti.
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => dismiss('rejected')}
            className="border border-white/30 px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Rifiuta
          </button>
          <button
            onClick={() => dismiss('accepted')}
            className="bg-red text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-dark transition-colors"
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Mount it in the root layout**

In `app/layout.tsx`, add the import:

```tsx
import CookieBanner from '@/components/layout/CookieBanner'
```

Add `<CookieBanner />` as the last element inside `<body>`, after `<Footer />`:

```tsx
        <Footer />
        <CookieBanner />
```

(This task assumes Task 11's `ChromeGate` refactor has not yet landed; if executed after Task 11, add `<CookieBanner />` as a sibling of `<ChromeGate>` inside `<body>` instead — see Task 11 Step 2 for the exact resulting file.)

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 4: Commit**

```bash
git add components/layout/CookieBanner.tsx app/layout.tsx
git commit -m "feat: add cookie consent banner"
```

---

### Task 9: Checkout input polish

**Files:**
- Modify: `app/checkout/page.tsx`

**Interfaces:**
- None — attribute-only edits to existing `<input>` elements, no logic change.

- [ ] **Step 1: Add type/autoComplete attributes to the step-1 fields**

In `app/checkout/page.tsx`, replace:

```tsx
              <input placeholder="Email *" value={form.email} onChange={e => updateForm('email', e.target.value)} className={inputClass} />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Nome *" value={form.nome} onChange={e => updateForm('nome', e.target.value)} className={inputClass} />
                <input placeholder="Cognome *" value={form.cognome} onChange={e => updateForm('cognome', e.target.value)} className={inputClass} />
              </div>
              <input placeholder="Indirizzo *" value={form.indirizzo} onChange={e => updateForm('indirizzo', e.target.value)} className={inputClass} />
              <div className="grid grid-cols-3 gap-4">
                <input placeholder="CAP *" value={form.cap} onChange={e => updateForm('cap', e.target.value)} className={inputClass} />
                <input placeholder="Città *" value={form.citta} onChange={e => updateForm('citta', e.target.value)} className={`${inputClass} col-span-2`} />
              </div>
```

with:

```tsx
              <input type="email" autoComplete="email" placeholder="Email *" value={form.email} onChange={e => updateForm('email', e.target.value)} className={inputClass} />
              <div className="grid grid-cols-2 gap-4">
                <input autoComplete="given-name" placeholder="Nome *" value={form.nome} onChange={e => updateForm('nome', e.target.value)} className={inputClass} />
                <input autoComplete="family-name" placeholder="Cognome *" value={form.cognome} onChange={e => updateForm('cognome', e.target.value)} className={inputClass} />
              </div>
              <input autoComplete="street-address" placeholder="Indirizzo *" value={form.indirizzo} onChange={e => updateForm('indirizzo', e.target.value)} className={inputClass} />
              <div className="grid grid-cols-3 gap-4">
                <input inputMode="numeric" autoComplete="postal-code" placeholder="CAP *" value={form.cap} onChange={e => updateForm('cap', e.target.value)} className={inputClass} />
                <input autoComplete="address-level2" placeholder="Città *" value={form.citta} onChange={e => updateForm('citta', e.target.value)} className={`${inputClass} col-span-2`} />
              </div>
```

- [ ] **Step 2: Add type/autoComplete attributes to the step-3 card fields**

Replace:

```tsx
                  <input placeholder="Numero carta *" className={inputClass} maxLength={19} />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Scadenza MM/AA *" className={inputClass} />
                    <input placeholder="CVV *" className={inputClass} maxLength={4} />
                  </div>
                  <input placeholder="Nome sulla carta *" className={inputClass} />
```

with:

```tsx
                  <input inputMode="numeric" autoComplete="cc-number" placeholder="Numero carta *" className={inputClass} maxLength={19} />
                  <div className="grid grid-cols-2 gap-4">
                    <input autoComplete="cc-exp" placeholder="Scadenza MM/AA *" className={inputClass} />
                    <input inputMode="numeric" autoComplete="cc-csc" placeholder="CVV *" className={inputClass} maxLength={4} />
                  </div>
                  <input autoComplete="cc-name" placeholder="Nome sulla carta *" className={inputClass} />
```

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 4: Commit**

```bash
git add app/checkout/page.tsx
git commit -m "feat: add autocomplete and input-mode attributes to checkout form"
```

---

### Task 10: Home "Più venduti" section

**Files:**
- Create: `components/home/BestsellersSection.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `getReviewSummary(productId: string): ReviewSummary` (existing, `lib/reviews.ts`), `ProductCard` (existing, `components/shop/ProductCard.tsx`).

- [ ] **Step 1: Create the section**

Create `components/home/BestsellersSection.tsx`:

```tsx
import Link from 'next/link'
import ProductCard from '@/components/shop/ProductCard'
import products from '@/data/products.json'
import type { Product } from '@/lib/types'
import { getReviewSummary } from '@/lib/reviews'

export default function BestsellersSection() {
  const ranked = [...(products as Product[])]
    .sort((a, b) => getReviewSummary(b.id).count - getReviewSummary(a.id).count)
    .slice(0, 8)

  return (
    <section className="py-20 bg-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-4xl font-black">
            I più <em className="text-red">venduti</em>
          </h2>
          <Link href="/shop" className="text-sm font-semibold text-red underline underline-offset-4 hover:text-red-dark">
            Vedi tutti →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {ranked.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Wire it into the home page**

In `app/page.tsx`, add the import:

```tsx
import BestsellersSection from '@/components/home/BestsellersSection'
```

Replace:

```tsx
      <HeroSection />
      <CategoryGrid />
      <NewArrivalsCarousel />
      <TrustSection />
      <BrandCarousel />
```

with:

```tsx
      <HeroSection />
      <CategoryGrid />
      <NewArrivalsCarousel />
      <BestsellersSection />
      <TrustSection />
      <BrandCarousel />
```

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, home page (`/`) size may grow slightly but still builds as a static route

- [ ] **Step 4: Commit**

```bash
git add components/home/BestsellersSection.tsx app/page.tsx
git commit -m "feat: add best-sellers section to home page"
```

---

### Task 11: Distraction-free checkout layout

**Files:**
- Create: `components/layout/ChromeGate.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `AnnouncementBar` (existing, `components/layout/AnnouncementBar.tsx`, no props), `Navbar` (existing, `components/layout/Navbar.tsx`, no props), `Footer` (existing, `components/layout/Footer.tsx`, no props).
- Produces: `ChromeGate({ children: React.ReactNode })` — a client component that decides which chrome to render based on the current route; imported once, by `app/layout.tsx`.

- [ ] **Step 1: Create ChromeGate**

Create `components/layout/ChromeGate.tsx`:

```tsx
'use client'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import AnnouncementBar from './AnnouncementBar'
import Navbar from './Navbar'
import Footer from './Footer'

const MINIMAL_CHROME_PATHS = ['/checkout', '/checkout/success']

export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const minimal = MINIMAL_CHROME_PATHS.includes(pathname)

  if (minimal) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="relative h-10 w-[93px]">
              <Image src="/logo-selleria-galazzo.png" alt="Selleria Galazzo" fill className="object-contain object-left" priority />
            </Link>
            <span className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Lock size={14} />
              Pagamento sicuro
            </span>
          </div>
        </div>
        <main className="pt-16">{children}</main>
      </>
    )
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <AnnouncementBar />
        <Navbar />
      </div>
      <main className="pt-24">{children}</main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Route layout.tsx through ChromeGate**

Replace the full contents of `app/layout.tsx` with:

```tsx
import type { Metadata } from 'next'
import './globals.css'
import ChromeGate from '@/components/layout/ChromeGate'
import CookieBanner from '@/components/layout/CookieBanner'

export const metadata: Metadata = {
  title: 'Selleria Galazzo — Articoli Equestri Online',
  description: 'Selleria online specializzata in articoli per equitazione, monta inglese, western e prodotti per la scuderia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="antialiased">
        <ChromeGate>{children}</ChromeGate>
        <CookieBanner />
      </body>
    </html>
  )
}
```

(This supersedes Task 8 Step 2's placement of `<CookieBanner />` — it stays a sibling of `<ChromeGate>` so it renders on every route, including `/checkout`.)

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, full page count unchanged (~3263+, plus `/wishlist` from Task 3)

- [ ] **Step 4: Commit**

```bash
git add components/layout/ChromeGate.tsx app/layout.tsx
git commit -m "feat: hide full navbar/footer on checkout for a distraction-free layout"
```

---

### Task 12: Full build, test, and manual verification

**Files:** None (verification-only task).

**Interfaces:** None.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all suites pass, including the 2 new suites from Tasks 1–2 (`wishlist-store.test.ts`, `badges.test.ts`) — total test count increases from 76 to 76 + 5 (wishlist) + 5 (badges) = 86.

- [ ] **Step 2: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: zero TypeScript errors; build succeeds; route list includes `○ /wishlist` (new) alongside all previously existing routes.

- [ ] **Step 3: Smoke test the production build**

```bash
npm run start &
sleep 3
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/wishlist
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/checkout
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/checkout/success
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/this-page-does-not-exist
lsof -ti:3000 | xargs kill -9
```

Expected: `200` for `/`, `/wishlist`, `/checkout`, `/checkout/success`; `404` for the nonexistent page.

- [ ] **Step 4: Browser check of the golden path**

Using the claude-in-chrome MCP tools against a freshly started `npm run start` server:

1. Load `/` — confirm a "Più venduti" section appears between "Gli ultimi arrivati" and the trust section, confirm the cookie banner appears at the bottom, click "Accetta", reload the page, confirm it does not reappear.
2. On a shop or home product card, hover to reveal the heart icon, click it — confirm it turns filled/red immediately (no page reload). Click the Navbar heart icon — confirm it navigates to `/wishlist` and shows the just-added product with a working "Rimuovi"/toggle-off path (click its card heart again, confirm it's removed from the wishlist page after a refresh).
3. Load a product page — confirm the "Aggiungi alla wishlist" button toggles to "Nella tua wishlist ✓" on click and back on a second click.
4. Add a low-value item to the cart (under €80 subtotal) and open the cart drawer — confirm the "Aggiungi €X per la spedizione gratuita" line appears above the subtotal. Go to `/cart` — confirm the "← Continua lo shopping" link is present next to the item count.
5. Load `/checkout`, fill step 1 — confirm no Navbar/mega-menu and no Footer are visible, only the minimal logo + "Pagamento sicuro" bar. Confirm `/checkout/success` (reachable by completing the flow) also shows the minimal bar.
6. Load a nonexistent URL (e.g. `/foo-bar-baz`) — confirm the branded 404 page renders with a working "Vai allo shop" link, and that the full Navbar/Footer are present (404 is not in `MINIMAL_CHROME_PATHS`).
7. Scroll down on any normal page, click the Footer's "↑ Torna su" link — confirm the page scrolls smoothly to the top.
8. Check the browser console for JS errors during the whole pass — expect none from the application.

- [ ] **Step 5: Fix any bugs found**

If Steps 1–4 reveal any issue, fix it directly, re-run the affected step(s), and commit the fix:

```bash
git add -A
git commit -m "fix: <describe the bug fixed during CRO-checklist batch verification>"
```

If Steps 1–4 pass cleanly, skip this step — nothing to commit.
