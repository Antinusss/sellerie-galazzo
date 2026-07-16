# Guida ai Prodotti Link + Full-Screen Hero + Search Results Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the non-clickable "Guida ai prodotti" menu item, redesign the home hero as a full-screen background photo, and give the header search bar a real results page with improved multi-field matching.

**Architecture:** Three independent, small feature clusters sharing no code except a lib-level extraction (`GUIDE_LINKS`) and the reworked `searchProducts` function. Each is a self-contained set of file changes with no cross-task ordering dependency except Task 1 (search) must land before Task 5 (search results page consumes it) and Task 2 (guide-links extraction) before Task 3 (guide page consumes it).

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Jest.

## Global Constraints

- No true AI/embedding-based semantic search — confirmed with the client; the agreed substitute is word-based, multi-field matching (name + brand + category + description).
- Reuse the existing hero photo (Unsplash) — no new image asset.
- Reuse existing Tailwind color utilities only (`bg-red`, `hover:bg-red-dark`, `text-red`, `bg-sand`, `text-sand`, `bg-gray-light`, `text-gray-400`, plus `text-white`/`text-white/60`/`text-white/80`/`border-white` which are standard Tailwind, not custom) — no new custom colors.
- `searchProducts`'s public signature stays `searchProducts(products: Product[], query: string, limit?: number): Product[]` with a default `limit` of `8`, so `HeaderSearchBar` and `SearchOverlay` need no changes to keep their current capped dropdown behavior.
- Component-level changes in this codebase are not unit-tested (established convention — only `lib/` pure modules have Jest tests); verify component tasks via `npm run build` + manual/browser checks instead of RTL tests.
- Italian copy throughout, matching the site's existing tone.

---

### Task 1: Word-based multi-field search matching

**Files:**
- Modify: `lib/search.ts`
- Test: `__tests__/search.test.ts`

**Interfaces:**
- Produces: `searchProducts(products: Product[], query: string, limit = 8): Product[]` — same name/shape as today, reworked matching logic. Consumed unchanged by `HeaderSearchBar.tsx` and `SearchOverlay.tsx` (Task 5 wires a new caller that passes `Infinity` as `limit` for "no cap").

- [ ] **Step 1: Replace the test file with the reworked cases**

Replace the full contents of `__tests__/search.test.ts`:

```ts
import { searchProducts } from '@/lib/search'
import type { Product } from '@/lib/types'

function product(id: string, overrides: Partial<Product> = {}): Product {
  return {
    id, name: 'Prodotto generico', slug: `p${id}`, price: 100, originalPrice: null,
    category: 'Scuderia', categoryPath: ['Scuderia'], brand: 'X', images: [],
    description: '', specs: '', inStock: true,
    ...overrides,
  }
}

describe('searchProducts', () => {
  it('returns [] for an empty query', () => {
    expect(searchProducts([product('1')], '')).toEqual([])
  })

  it('returns [] for a whitespace-only query', () => {
    expect(searchProducts([product('1')], '   ')).toEqual([])
  })

  it('matches case-insensitively on product name', () => {
    const products = [
      product('1', { name: 'Cavezza corda' }),
      product('2', { name: 'Cavezza nylon' }),
      product('3', { name: 'Sella inglese' }),
    ]
    expect(searchProducts(products, 'CAVEZZA').map(p => p.id)).toEqual(['1', '2'])
  })

  it('matches on the brand field', () => {
    const products = [
      product('1', { name: 'Sapone per il cuoio', brand: 'Acavallo' }),
      product('2', { name: 'Sapone neutro', brand: 'Equestro' }),
    ]
    expect(searchProducts(products, 'acavallo').map(p => p.id)).toEqual(['1'])
  })

  it('matches on the category field', () => {
    const products = [
      product('1', { category: 'Monta Western' }),
      product('2', { category: 'Scuderia' }),
    ]
    expect(searchProducts(products, 'western').map(p => p.id)).toEqual(['1'])
  })

  it('matches on the description field', () => {
    const products = [
      product('1', { description: 'Ideale per il freddo invernale' }),
      product('2', { description: 'Prodotto estivo traspirante' }),
    ]
    expect(searchProducts(products, 'invernale').map(p => p.id)).toEqual(['1'])
  })

  it('requires every query word to match, in any field', () => {
    const products = [
      product('1', { name: 'Guanti da equitazione', brand: 'Acavallo' }),
      product('2', { name: 'Guanti da giardinaggio', brand: 'Equestro' }),
    ]
    expect(searchProducts(products, 'guanti acavallo').map(p => p.id)).toEqual(['1'])
  })

  it('returns [] when nothing matches', () => {
    expect(searchProducts([product('1', { name: 'Sella' })], 'zzz')).toEqual([])
  })

  it('defaults to a limit of 8 results', () => {
    const products = Array.from({ length: 10 }, (_, i) => product(String(i), { name: 'Cavezza' }))
    expect(searchProducts(products, 'cavezza')).toHaveLength(8)
  })

  it('respects an explicit limit', () => {
    const products = [product('1', { name: 'Cavezza corda' }), product('2', { name: 'Cavezza nylon' })]
    expect(searchProducts(products, 'cavezza', 1).map(p => p.id)).toEqual(['1'])
  })

  it('returns all matches uncapped when limit is Infinity', () => {
    const products = Array.from({ length: 10 }, (_, i) => product(String(i), { name: 'Cavezza' }))
    expect(searchProducts(products, 'cavezza', Infinity)).toHaveLength(10)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest __tests__/search.test.ts`
Expected: FAIL — the brand/category/description/multi-word tests fail against the current single-field implementation (name-substring-only matches on brand/category/description tests would return `[]` instead of the expected id, and the multi-word test would match both products since the current code only checks the whole query string against `name`).

- [ ] **Step 3: Rewrite the implementation**

Replace the full contents of `lib/search.ts`:

```ts
import type { Product } from './types'

export function searchProducts(products: Product[], query: string, limit = 8): Product[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  return products
    .filter(p => {
      const haystacks = [p.name, p.brand, p.category, p.description].map(s => s.toLowerCase())
      return words.every(word => haystacks.some(h => h.includes(word)))
    })
    .slice(0, limit)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest __tests__/search.test.ts`
Expected: PASS, 11/11 tests

- [ ] **Step 5: Commit**

```bash
git add lib/search.ts __tests__/search.test.ts
git commit -m "feat: word-based multi-field product search matching"
```

---

### Task 2: Extract GUIDE_LINKS and fix the Navbar link

**Files:**
- Create: `lib/guide-links.ts`
- Modify: `components/layout/Navbar.tsx`

**Interfaces:**
- Produces: `GUIDE_LINKS: { label: string; href: string }[]` from `lib/guide-links.ts`, consumed by `components/layout/Navbar.tsx` (this task) and `app/guida-ai-prodotti/page.tsx` (Task 3).

- [ ] **Step 1: Create the shared constant**

Create `lib/guide-links.ts`:

```ts
export interface GuideLink {
  label: string
  href: string
}

export const GUIDE_LINKS: GuideLink[] = [
  { label: 'Cura del cavallo', href: '/shop/scuderia/cura-del-cavallo' },
  { label: 'Cura del cuoio', href: '/shop/scuderia/cura-del-cuoio' },
  { label: 'Attrezzatura da scuderia', href: '/shop/scuderia/attrezzatura-da-scuderia' },
  { label: 'Selle e accessori (Inglese)', href: '/shop/monta-inglese/cavallo/selle-e-accessori' },
  { label: 'Coperte', href: '/shop/monta-inglese/cavallo/coperte' },
  { label: 'Protezioni', href: '/shop/monta-inglese/cavallo/protezioni' },
  { label: 'Selle e accessori (Western)', href: '/shop/monta-western/cavallo/selle-e-accessori' },
  { label: 'Briglie e accessori', href: '/shop/monta-inglese/cavallo/briglie-e-accessori' },
]
```

- [ ] **Step 2: Remove the local constant from Navbar.tsx and import the shared one**

In `components/layout/Navbar.tsx`, remove this block entirely:

```tsx
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
```

Add this import alongside the other `lib/` imports at the top of the file:

```tsx
import { GUIDE_LINKS } from '@/lib/guide-links'
```

- [ ] **Step 3: Turn the "Guida ai prodotti" span into a real link**

Replace:

```tsx
          <div className="group relative">
            <span className="text-sm font-medium text-black h-12 inline-flex items-center cursor-default">
              Guida ai prodotti
            </span>
            <div className="absolute right-0 top-full hidden group-hover:block bg-white shadow-lg rounded-xl p-6 z-50 w-64">
```

with:

```tsx
          <div className="group relative">
            <Link href="/guida-ai-prodotti" className="text-sm font-medium text-black hover:text-red transition-colors h-12 inline-flex items-center">
              Guida ai prodotti
            </Link>
            <div className="absolute right-0 top-full hidden group-hover:block bg-white shadow-lg rounded-xl p-6 z-50 w-64">
```

(`Link` is already imported in this file; the flyout content below this block — the `GUIDE_LINKS.map(...)` — is unchanged.)

- [ ] **Step 4: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 5: Commit**

```bash
git add lib/guide-links.ts components/layout/Navbar.tsx
git commit -m "feat: extract GUIDE_LINKS and make Guida ai prodotti a real link"
```

---

### Task 3: Guida ai prodotti landing page

**Files:**
- Create: `app/guida-ai-prodotti/page.tsx`

**Interfaces:**
- Consumes: `GUIDE_LINKS` from `lib/guide-links.ts` (already exists from Task 2).

- [ ] **Step 1: Create the page**

Create `app/guida-ai-prodotti/page.tsx`:

```tsx
import Link from 'next/link'
import { GUIDE_LINKS } from '@/lib/guide-links'

export const metadata = { title: 'Guida ai prodotti — Selleria Galazzo' }

export default function GuidaAiProdottiPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-black mb-8">
        Guida ai <em className="text-red">prodotti</em>
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {GUIDE_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-center text-center bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow font-semibold text-black hover:text-red"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, new static route `○ /guida-ai-prodotti` appears in the route list

- [ ] **Step 3: Commit**

```bash
git add app/guida-ai-prodotti/page.tsx
git commit -m "feat: add guida ai prodotti landing page"
```

---

### Task 4: Full-screen hero

**Files:**
- Modify: `components/home/HeroSection.tsx`

**Interfaces:**
- None — self-contained component rewrite, no props, no new dependencies.

- [ ] **Step 1: Replace the full file**

Replace the full contents of `components/home/HeroSection.tsx`:

```tsx
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1600&q=85"
        alt="Cavaliere in azione"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-xl"
        >
          <p className="text-sand font-semibold tracking-widest uppercase text-sm mb-4">
            Dal 1985 · Selleria Italiana
          </p>
          <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight mb-6">
            Equipaggiati per{' '}
            <em className="text-red">vincere</em>
          </h1>
          <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-md">
            Prodotti selezionati per monta inglese, western e scuderia. Qualità professionale per ogni cavaliere.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="bg-red text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-red-dark transition-colors"
            >
              Scopri lo Shop
            </Link>
            <Link
              href="/shop?sort=newest"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-white hover:text-black transition-colors"
            >
              Le Novità
            </Link>
          </div>
          <div className="flex flex-wrap gap-8 mt-12 text-sm">
            <div>
              <div className="font-black text-2xl text-white">10k+</div>
              <div className="text-white/60">Cavalieri</div>
            </div>
            <div>
              <div className="font-black text-2xl text-white">200+</div>
              <div className="text-white/60">Brand selezionati</div>
            </div>
            <div>
              <div className="font-black text-2xl text-white">40+</div>
              <div className="text-white/60">Anni di esperienza</div>
            </div>
            <div>
              <div className="font-black text-2xl text-white">4.8★</div>
              <div className="text-white/60">Recensioni verificate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

Note: the secondary CTA ("Le Novità") switches from a black-outlined button (`border-black`, `hover:bg-black`) to a white-outlined one (`border-white`, `hover:bg-white hover:text-black`) — it now sits on a dark photo instead of a white background, so the outline color must invert to stay visible. This is a deliberate, necessary adaptation, not a copy-paste error.

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 3: Commit**

```bash
git add components/home/HeroSection.tsx
git commit -m "feat: full-screen background photo for home hero"
```

---

### Task 5: Search results page and search bar submit wiring

**Files:**
- Create: `app/cerca/page.tsx`
- Modify: `components/layout/HeaderSearchBar.tsx`

**Interfaces:**
- Consumes: `searchProducts(products: Product[], query: string, limit = 8): Product[]` from `lib/search.ts` (reworked in Task 1, already committed — this task calls it with `Infinity` as the third argument to get every match uncapped).
- Consumes: `PaginatedProductGrid({ products: Product[] })` (existing, `components/shop/PaginatedProductGrid.tsx`).

- [ ] **Step 1: Create the search results page**

Create `app/cerca/page.tsx`:

```tsx
'use client'
import { useSearchParams } from 'next/navigation'
import allProducts from '@/data/products.json'
import type { Product } from '@/lib/types'
import { searchProducts } from '@/lib/search'
import PaginatedProductGrid from '@/components/shop/PaginatedProductGrid'

const products = allProducts as Product[]

export default function CercaPage() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const results = searchProducts(products, q, Infinity)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-black mb-2">
        Risultati per <em className="text-red">&quot;{q}&quot;</em>
      </h1>
      <p className="text-sm text-gray-400 mb-8">{results.length} prodotti trovati</p>
      {results.length === 0 ? (
        <p className="text-gray-400">Nessun prodotto corrisponde alla tua ricerca.</p>
      ) : (
        <PaginatedProductGrid products={results} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Wire the search bar to submit to it**

In `components/layout/HeaderSearchBar.tsx`, add the import:

```tsx
import { useRouter } from 'next/navigation'
```

Inside the component, alongside the existing `const containerRef = useRef<HTMLDivElement>(null)` line, add:

```tsx
  const router = useRouter()
```

Replace:

```tsx
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
```

with:

```tsx
      <form
        onSubmit={e => {
          e.preventDefault()
          if (!query.trim()) return
          setOpen(false)
          router.push(`/cerca?q=${encodeURIComponent(query)}`)
        }}
        className="flex items-center gap-2 bg-gray-light rounded-full px-4 py-2"
      >
        <button type="submit" className="text-gray-400 shrink-0 hover:text-red transition-colors">
          <Search size={16} />
        </button>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Cerca un prodotto..."
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </form>
```

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, new static route `○ /cerca` appears in the route list

- [ ] **Step 4: Commit**

```bash
git add app/cerca/page.tsx components/layout/HeaderSearchBar.tsx
git commit -m "feat: add search results page and wire search bar submit"
```

---

### Task 6: Full build, test, and manual verification

**Files:** None (verification-only task).

**Interfaces:** None.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all suites pass; `search.test.ts` now has 11 tests (up from 5), so the total test count increases by 6.

- [ ] **Step 2: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: zero TypeScript errors; build succeeds; route list includes `○ /guida-ai-prodotti` and `○ /cerca` alongside all previously existing routes.

- [ ] **Step 3: Smoke test the production build**

```bash
npm run start &
sleep 3
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/guida-ai-prodotti
curl -o /dev/null -s -w "%{http_code}\n" "http://localhost:3000/cerca?q=cavezza"
lsof -ti:3000 | xargs kill -9
```

Expected: `200` for every route.

- [ ] **Step 4: Browser check of the golden path**

Using the claude-in-chrome MCP tools against a freshly started `npm run start` server:

1. Load `/` — confirm the hero photo now fills the entire section edge-to-edge (not just a right-hand column), text is legible over it, both CTA buttons and all four stats are visible and readable.
2. In the Navbar, hover "Guida ai prodotti" — confirm the existing flyout still shows the 8 links. Click the "Guida ai prodotti" label itself (not a flyout link) — confirm it navigates to `/guida-ai-prodotti` and shows a grid of the same 8 links, each clickable through to its category page.
3. In the header search bar, type "acavallo" — confirm the live dropdown still shows matching products. Press Enter — confirm it navigates to `/cerca?q=acavallo` showing a full paginated grid of every matching product (not capped at 8), with a "N prodotti trovati" count.
4. Type a query with two words that only match together across different fields (e.g. a brand name plus a generic word present in that brand's product names) and confirm the results page returns the intersection, not everything.
5. Clear the search bar and try a nonsense query (e.g. "zzzxxxyyy") — confirm `/cerca` shows the "Nessun prodotto corrisponde" empty state, not an error.
6. Check the browser console for JS errors during the whole pass — expect none from the application.

- [ ] **Step 5: Fix any bugs found**

If Steps 1–4 reveal any issue, fix it directly, re-run the affected step(s), and commit the fix:

```bash
git add -A
git commit -m "fix: <describe the bug fixed during menu/hero/search verification>"
```

If Steps 1–4 pass cleanly, skip this step — nothing to commit.
