# Account Emulation + Home Testimonials Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fully client-side, mock account area (login, register, dashboard, Navbar entry point) and a fake reviews carousel on the home page.

**Architecture:** A new `lib/auth-store.ts` Zustand+persist store (same family as `lib/wishlist-store.ts`) backs three new routes under `/account`. A new `TestimonialsCarousel` component reuses the existing deterministic `lib/reviews.ts` data (no new fabricated content) and is wired into the home page.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Zustand + `persist`, Lucide React icons, Jest + `@testing-library/react`.

## Global Constraints

- No real authentication — `login`/`register` accept any non-empty input, no password is stored or checked. This is consistent with the existing mock payment methods on `/checkout`.
- Auth state persists via `localStorage` only, same as cart/wishlist — key `selleria-galazzo-auth`.
- Cart and wishlist state are never touched by login/logout.
- No new fabricated review text — the testimonials carousel reuses `lib/reviews.ts`'s existing deterministic sample reviews (already an approved synthetic-data exception).
- Component-level changes in this codebase are not unit-tested (established convention — only `lib/` pure modules have Jest tests); verify component tasks via `npm run build` + manual/browser checks instead of RTL tests.
- Reuse existing Tailwind color utilities only (`bg-red`, `hover:bg-red-dark`, `text-red`, `bg-sand`, `text-sand`, `bg-gray-light`, `border-gray-200`, `text-gray-400`, etc.) — no new colors.
- Italian copy throughout, matching the site's existing tone.

---

### Task 1: Auth data layer

**Files:**
- Create: `lib/auth-store.ts`
- Test: `__tests__/auth-store.test.ts`

**Interfaces:**
- Produces: `useAuthStore(): { user: { name: string; email: string } | null; login(email: string, password: string): void; register(nome: string, cognome: string, email: string, password: string): void; logout(): void }` — a Zustand hook, imported by Task 2 (login/register pages), Task 3 (dashboard), and Task 4 (Navbar).

- [ ] **Step 1: Write the failing test**

Create `__tests__/auth-store.test.ts`:

```ts
import { act, renderHook } from '@testing-library/react'
import { useAuthStore } from '@/lib/auth-store'

beforeEach(() => {
  const { result } = renderHook(() => useAuthStore())
  act(() => result.current.logout())
})

describe('initial state', () => {
  it('starts with no user', () => {
    const { result } = renderHook(() => useAuthStore())
    expect(result.current.user).toBeNull()
  })
})

describe('login', () => {
  it('sets a user with a name derived from the email local-part', () => {
    const { result } = renderHook(() => useAuthStore())
    act(() => result.current.login('mario.rossi@example.com', 'anything'))
    expect(result.current.user).toEqual({ name: 'mario.rossi', email: 'mario.rossi@example.com' })
  })
})

describe('register', () => {
  it('sets a user with the combined name and given email', () => {
    const { result } = renderHook(() => useAuthStore())
    act(() => result.current.register('Mario', 'Rossi', 'mario@example.com', 'anything'))
    expect(result.current.user).toEqual({ name: 'Mario Rossi', email: 'mario@example.com' })
  })
})

describe('logout', () => {
  it('clears the user', () => {
    const { result } = renderHook(() => useAuthStore())
    act(() => result.current.login('a@b.com', 'x'))
    act(() => result.current.logout())
    expect(result.current.user).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/auth-store.test.ts`
Expected: FAIL with `Cannot find module '@/lib/auth-store'`

- [ ] **Step 3: Write minimal implementation**

Create `lib/auth-store.ts`:

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  name: string
  email: string
}

interface AuthState {
  user: AuthUser | null
  login: (email: string, password: string) => void
  register: (nome: string, cognome: string, email: string, password: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email, _password) => set({ user: { name: email.split('@')[0], email } }),
      register: (nome, cognome, email, _password) => set({ user: { name: `${nome} ${cognome}`, email } }),
      logout: () => set({ user: null }),
    }),
    { name: 'selleria-galazzo-auth' }
  )
)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/auth-store.test.ts`
Expected: PASS, 4/4 tests

- [ ] **Step 5: Commit**

```bash
git add lib/auth-store.ts __tests__/auth-store.test.ts
git commit -m "feat: add auth store"
```

---

### Task 2: Login and register pages

**Files:**
- Create: `app/account/login/page.tsx`
- Create: `app/account/register/page.tsx`

**Interfaces:**
- Consumes: `useAuthStore()` from Task 1 (`lib/auth-store.ts`).

- [ ] **Step 1: Create the login page**

Create `app/account/login/page.tsx`:

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuthStore()
  const router = useRouter()

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sand transition-colors"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, password)
    router.push('/account')
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-3xl font-black mb-8 text-center">
        Accedi al tuo <em className="text-red">account</em>
      </h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <input type="email" required autoComplete="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
        <input type="password" required autoComplete="current-password" placeholder="Password *" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
        <button type="submit" className="w-full bg-red text-white py-4 rounded-full font-bold hover:bg-red-dark transition-colors">
          Accedi
        </button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-6">
        Non hai un account? <Link href="/account/register" className="text-red font-semibold hover:text-red-dark">Registrati</Link>
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Create the register page**

Create `app/account/register/page.tsx`:

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'

export default function RegisterPage() {
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { register } = useAuthStore()
  const router = useRouter()

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sand transition-colors"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register(nome, cognome, email, password)
    router.push('/account')
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-3xl font-black mb-8 text-center">
        Crea il tuo <em className="text-red">account</em>
      </h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <input required autoComplete="given-name" placeholder="Nome *" value={nome} onChange={e => setNome(e.target.value)} className={inputClass} />
          <input required autoComplete="family-name" placeholder="Cognome *" value={cognome} onChange={e => setCognome(e.target.value)} className={inputClass} />
        </div>
        <input type="email" required autoComplete="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
        <input type="password" required autoComplete="new-password" placeholder="Password *" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
        <button type="submit" className="w-full bg-red text-white py-4 rounded-full font-bold hover:bg-red-dark transition-colors">
          Crea account
        </button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-6">
        Hai già un account? <Link href="/account/login" className="text-red font-semibold hover:text-red-dark">Accedi</Link>
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, new static routes `○ /account/login` and `○ /account/register` appear in the route list

- [ ] **Step 4: Commit**

```bash
git add app/account/login/page.tsx app/account/register/page.tsx
git commit -m "feat: add login and register pages"
```

---

### Task 3: Account dashboard

**Files:**
- Create: `app/account/page.tsx`

**Interfaces:**
- Consumes: `useAuthStore()` from Task 1 (`lib/auth-store.ts`).

- [ ] **Step 1: Create the dashboard page**

Create `app/account/page.tsx`:

```tsx
'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, Heart } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'

export default function AccountPage() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push('/account/login')
  }, [user, router])

  if (!user) return null

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black mb-2">
        Ciao, <em className="text-red">{user.name}</em>
      </h1>
      <p className="text-gray-400 mb-10">{user.email}</p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="bg-gray-light rounded-2xl p-6">
          <h2 className="font-black text-lg mb-4">I tuoi dati</h2>
          <p className="text-sm text-gray-600 mb-1"><span className="text-gray-400">Nome:</span> {user.name}</p>
          <p className="text-sm text-gray-600"><span className="text-gray-400">Email:</span> {user.email}</p>
        </div>

        <div className="bg-gray-light rounded-2xl p-6">
          <h2 className="font-black text-lg mb-4">I tuoi ordini</h2>
          <div className="text-center py-6">
            <Package size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400 mb-4">Non hai ancora effettuato ordini.</p>
            <Link href="/shop" className="text-sm font-semibold text-red hover:text-red-dark">
              Vai allo shop →
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Link
          href="/wishlist"
          className="flex-1 flex items-center justify-center gap-2 border-2 border-black py-3 rounded-full font-bold hover:bg-black hover:text-white transition-colors"
        >
          <Heart size={18} />
          La tua wishlist
        </Link>
        <button
          onClick={handleLogout}
          className="flex-1 border-2 border-gray-200 py-3 rounded-full font-bold text-gray-500 hover:border-red hover:text-red transition-colors"
        >
          Esci
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, new static route `○ /account` appears in the route list

- [ ] **Step 3: Commit**

```bash
git add app/account/page.tsx
git commit -m "feat: add account dashboard page"
```

---

### Task 4: Navbar account entry point

**Files:**
- Modify: `components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: `useAuthStore()` from Task 1 (`lib/auth-store.ts`).

- [ ] **Step 1: Add the User icon import**

In `components/layout/Navbar.tsx`, replace:

```tsx
import { ShoppingCart, Heart, Search, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'
```

with:

```tsx
import { ShoppingCart, Heart, Search, User, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'
import { useAuthStore } from '@/lib/auth-store'
```

- [ ] **Step 2: Add the hook**

Inside the `Navbar` component, alongside the existing `const { productIds: wishlistIds } = useWishlistStore()` line, add:

```tsx
  const { user } = useAuthStore()
```

- [ ] **Step 3: Add the account icon between the wishlist heart and the cart button**

Replace:

```tsx
            <Link href="/wishlist" className="relative p-2 hover:text-red transition-colors">
              <Heart size={20} />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
            <button className="relative p-2 hover:text-red transition-colors" onClick={openCart}>
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
            <Link href={user ? '/account' : '/account/login'} className="p-2 hover:text-red transition-colors">
              <User size={20} />
            </Link>
            <button className="relative p-2 hover:text-red transition-colors" onClick={openCart}>
```

- [ ] **Step 4: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 5: Commit**

```bash
git add components/layout/Navbar.tsx
git commit -m "feat: add account entry point to Navbar"
```

---

### Task 5: Home testimonials carousel

**Files:**
- Create: `components/home/TestimonialsCarousel.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `getReviewSummary(productId: string): ReviewSummary` (existing, `lib/reviews.ts`, produces `{ rating, count, reviews: Review[] }` where `Review = { author, rating, date, text }`).

- [ ] **Step 1: Create the carousel**

Create `components/home/TestimonialsCarousel.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import products from '@/data/products.json'
import type { Product } from '@/lib/types'
import { getReviewSummary } from '@/lib/reviews'

const testimonials = [...(products as Product[])]
  .sort((a, b) => getReviewSummary(b.id).count - getReviewSummary(a.id).count)
  .slice(0, 8)
  .map(p => getReviewSummary(p.id).reviews[0])

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const testimonial = testimonials[index]

  const prev = () => setIndex(i => (i - 1 + testimonials.length) % testimonials.length)
  const next = () => setIndex(i => (i + 1) % testimonials.length)

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-black mb-10">
          Cosa dicono i nostri <em className="text-red">cavalieri</em>
        </h2>
        <div className="flex items-center justify-between gap-4">
          <button onClick={prev} className="p-2 rounded-full border-2 border-gray-200 hover:border-red hover:text-red transition-colors shrink-0">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-center gap-0.5 mb-4">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={18} className={i < Math.round(testimonial.rating) ? 'fill-sand text-sand' : 'text-gray-200'} />
              ))}
            </div>
            <p className="text-lg text-gray-700 mb-4">&ldquo;{testimonial.text}&rdquo;</p>
            <p className="font-bold">{testimonial.author}</p>
            <p className="text-sm text-gray-400">{testimonial.date}</p>
          </div>
          <button onClick={next} className="p-2 rounded-full border-2 border-gray-200 hover:border-red hover:text-red transition-colors shrink-0">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Wire it into the home page**

In `app/page.tsx`, add the import:

```tsx
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel'
```

Replace:

```tsx
      <HeroSection />
      <CategoryGrid />
      <NewArrivalsCarousel />
      <BestsellersSection />
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
      <TestimonialsCarousel />
      <BrandCarousel />
```

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 4: Commit**

```bash
git add components/home/TestimonialsCarousel.tsx app/page.tsx
git commit -m "feat: add testimonials carousel to home page"
```

---

### Task 6: Full build, test, and manual verification

**Files:** None (verification-only task).

**Interfaces:** None.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all suites pass, including the new `auth-store.test.ts` suite — total test count increases by 4.

- [ ] **Step 2: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: zero TypeScript errors; build succeeds; route list includes `○ /account`, `○ /account/login`, `○ /account/register` alongside all previously existing routes.

- [ ] **Step 3: Smoke test the production build**

```bash
npm run start &
sleep 3
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/account
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/account/login
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/account/register
lsof -ti:3000 | xargs kill -9
```

Expected: `200` for every route (`/account` returns 200 even though it client-side-redirects unauthenticated visitors to `/account/login` — the initial HTML still renders and returns 200 before the redirect fires).

- [ ] **Step 4: Browser check of the golden path**

Using the claude-in-chrome MCP tools against a freshly started `npm run start` server:

1. Load `/`, scroll to the testimonials section between "Perché sceglierci" (TrustSection) and the brand carousel — confirm a review renders (stars, quote, author, date), click the right arrow twice, confirm the content changes each time, then wait ~5s without clicking and confirm it auto-advances.
2. Click the new account icon in the Navbar while logged out — confirm it navigates to `/account/login`.
3. On `/account/login`, click "Registrati" — confirm it navigates to `/account/register`.
4. Fill the register form (Nome, Cognome, Email, Password) and submit — confirm it navigates to `/account` and shows "Ciao, {Nome} {Cognome}" and the email.
5. Confirm the account icon in the Navbar still resolves to `/account` now that a user is set (reload the page, click the icon, confirm no redirect to login).
6. On `/account`, confirm the empty "I tuoi ordini" state and the "La tua wishlist" link (click it, confirm it navigates to `/wishlist`).
7. Go back to `/account`, click "Esci" — confirm it redirects to `/` and the Navbar account icon now points back to `/account/login` (hover/click to confirm).
8. Navigate directly to `/account` while logged out (e.g. after the logout in the previous step) — confirm it redirects to `/account/login` automatically.
9. Check the browser console for JS errors during the whole pass — expect none from the application.

- [ ] **Step 5: Fix any bugs found**

If Steps 1–4 reveal any issue, fix it directly, re-run the affected step(s), and commit the fix:

```bash
git add -A
git commit -m "fix: <describe the bug fixed during account/testimonials verification>"
```

If Steps 1–4 pass cleanly, skip this step — nothing to commit.
