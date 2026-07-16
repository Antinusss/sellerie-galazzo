# Photo-Card Guide Links + Home Shortcut Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each "Guida ai prodotti" category a real representative photo, restyle its dedicated page to use photo cards, and surface the same shortcuts on the home page.

**Architecture:** `lib/guide-links.ts` gains a computed `image` field per entry, resolved once at module load from the real category/product data already in the repo. Two consumers (the existing `/guida-ai-prodotti` page, and a new home-page section) render the same photo-card visual pattern already established by `components/home/CategoryGrid.tsx`.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Jest.

## Global Constraints

- No fabricated or externally-sourced images — every photo is a real product image already in `data/products.json`, resolved via the existing `category-tree.ts` helpers.
- Reuse the existing photo-card visual pattern from `components/home/CategoryGrid.tsx` (aspect box, `Image fill object-cover`, `bg-gradient-to-t from-black/70 via-black/{20,10} to-transparent` overlay, white title pinned bottom-left) — no new visual pattern invented.
- The Navbar's "Guida ai prodotti" hover flyout stays a plain text list — do not add photos there.
- `lib/` modules must have Jest tests (established convention).
- Component-level changes are not unit-tested — verify via `npm run build` + manual/browser checks.
- Italian copy throughout.

---

### Task 1: Add a real representative image to each guide link

**Files:**
- Modify: `lib/guide-links.ts`
- Test: `__tests__/guide-links.test.ts`

**Interfaces:**
- Produces: `GUIDE_LINKS: { label: string; href: string; image: string }[]` (the `image` field is new; `label`/`href` unchanged) — consumed by `components/layout/Navbar.tsx` (already imports `GUIDE_LINKS`, ignores the new field), `app/guida-ai-prodotti/page.tsx` (Task 2), and `components/home/GuideLinksSection.tsx` (Task 3).

- [ ] **Step 1: Write the failing test**

Create `__tests__/guide-links.test.ts`:

```ts
import { GUIDE_LINKS } from '@/lib/guide-links'

describe('GUIDE_LINKS', () => {
  it('has 8 entries', () => {
    expect(GUIDE_LINKS).toHaveLength(8)
  })

  it('every entry has a non-empty label, href, and image', () => {
    for (const link of GUIDE_LINKS) {
      expect(link.label.length).toBeGreaterThan(0)
      expect(link.href.startsWith('/shop/')).toBe(true)
      expect(link.image.length).toBeGreaterThan(0)
    }
  })

  it('resolves a real product image for a known category', () => {
    const cureDelCavallo = GUIDE_LINKS.find(l => l.href === '/shop/scuderia/cura-del-cavallo')
    expect(cureDelCavallo).toBeDefined()
    expect(cureDelCavallo!.image).toMatch(/^https:\/\/selleriagalazzo\.com\//)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/guide-links.test.ts`
Expected: FAIL — `link.image` is `undefined` (property doesn't exist yet), so `link.image.length` throws.

- [ ] **Step 3: Rewrite the implementation**

Replace the full contents of `lib/guide-links.ts`:

```ts
import categoriesData from '@/data/categories.json'
import productsData from '@/data/products.json'
import type { Category, Product } from './types'
import { findCategoryBySlugPath, productsUnderCategory } from './category-tree'

export interface GuideLink {
  label: string
  href: string
  image: string
}

interface RawGuideLink {
  label: string
  href: string
}

const RAW_GUIDE_LINKS: RawGuideLink[] = [
  { label: 'Cura del cavallo', href: '/shop/scuderia/cura-del-cavallo' },
  { label: 'Cura del cuoio', href: '/shop/scuderia/cura-del-cuoio' },
  { label: 'Attrezzatura da scuderia', href: '/shop/scuderia/attrezzatura-da-scuderia' },
  { label: 'Selle e accessori (Inglese)', href: '/shop/monta-inglese/cavallo/selle-e-accessori' },
  { label: 'Coperte', href: '/shop/monta-inglese/cavallo/coperte' },
  { label: 'Protezioni', href: '/shop/monta-inglese/cavallo/protezioni' },
  { label: 'Selle e accessori (Western)', href: '/shop/monta-western/cavallo/selle-e-accessori' },
  { label: 'Briglie e accessori', href: '/shop/monta-inglese/cavallo/briglie-e-accessori' },
]

const categories = categoriesData as Category[]
const products = productsData as Product[]

function imageForHref(href: string): string {
  const slugPath = href.replace('/shop/', '').split('/')
  const category = findCategoryBySlugPath(categories, slugPath)
  const match = productsUnderCategory(products, category).find(p => p.images[0])
  return match?.images[0] ?? ''
}

export const GUIDE_LINKS: GuideLink[] = RAW_GUIDE_LINKS.map(link => ({
  ...link,
  image: imageForHref(link.href),
}))
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/guide-links.test.ts`
Expected: PASS, 3/3 tests

- [ ] **Step 5: Commit**

```bash
git add lib/guide-links.ts __tests__/guide-links.test.ts
git commit -m "feat: resolve a real product image per guide link category"
```

---

### Task 2: Restyle the guida ai prodotti page with photo cards

**Files:**
- Modify: `app/guida-ai-prodotti/page.tsx`

**Interfaces:**
- Consumes: `GUIDE_LINKS` from `lib/guide-links.ts` (Task 1, now includes `image: string`).

- [ ] **Step 1: Replace the full file**

Replace the full contents of `app/guida-ai-prodotti/page.tsx`:

```tsx
import Link from 'next/link'
import Image from 'next/image'
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
            className="group relative block aspect-[4/3] rounded-2xl overflow-hidden border-2 border-transparent hover:border-sand transition-all duration-300"
          >
            <Image
              src={link.image}
              alt={link.label}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-black">{link.label}</h3>
            </div>
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
Expected: build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/guida-ai-prodotti/page.tsx
git commit -m "feat: restyle guida ai prodotti page with photo cards"
```

---

### Task 3: Home page shortcut section

**Files:**
- Create: `components/home/GuideLinksSection.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `GUIDE_LINKS` from `lib/guide-links.ts` (Task 1, includes `image: string`).

- [ ] **Step 1: Create the section**

Create `components/home/GuideLinksSection.tsx`:

```tsx
import Link from 'next/link'
import Image from 'next/image'
import { GUIDE_LINKS } from '@/lib/guide-links'

export default function GuideLinksSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-4xl font-black">
            Trova quello che <em className="text-red">cerchi</em>
          </h2>
          <Link href="/guida-ai-prodotti" className="text-sm font-semibold text-red underline underline-offset-4 hover:text-red-dark">
            Vedi tutte →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {GUIDE_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative block aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-sand transition-all duration-300"
            >
              <Image
                src={link.image}
                alt={link.label}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-sm font-black leading-tight">{link.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Wire it into the home page**

In `app/page.tsx`, add the import:

```tsx
import GuideLinksSection from '@/components/home/GuideLinksSection'
```

Replace:

```tsx
      <HeroSection />
      <CategoryGrid />
      <NewArrivalsCarousel />
      <BestsellersSection />
      <TrustSection />
      <TestimonialsCarousel />
      <BrandCarousel />
```

with:

```tsx
      <HeroSection />
      <CategoryGrid />
      <GuideLinksSection />
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
git add components/home/GuideLinksSection.tsx app/page.tsx
git commit -m "feat: add guide-links shortcut section to home page"
```

---

### Task 4: Full build, test, and manual verification

**Files:** None (verification-only task).

**Interfaces:** None.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all suites pass, including the new `guide-links.test.ts` (3 tests) — total test count increases by 3.

- [ ] **Step 2: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: zero TypeScript errors; build succeeds; route list unchanged (no new routes, only visual changes to existing `/guida-ai-prodotti` and `/`).

- [ ] **Step 3: Smoke test the production build**

```bash
npm run start &
sleep 3
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/guida-ai-prodotti
lsof -ti:3000 | xargs kill -9
```

Expected: `200` for both routes.

- [ ] **Step 4: Browser check of the golden path**

Using the claude-in-chrome MCP tools against a freshly started `npm run start` server:

1. Load `/guida-ai-prodotti` — confirm all 8 cards show a real product photo background with a dark gradient and white title, not the old plain white cards. Click one card, confirm it navigates to the right category page.
2. Load `/` — scroll to the new section between "Scegli la tua disciplina" (CategoryGrid) and "Gli ultimi arrivati" (NewArrivalsCarousel) — confirm the heading "Trova quello che cerchi" and the same 8 photo cards render, and the "Vedi tutte →" link navigates to `/guida-ai-prodotti`.
3. Check the browser console for JS errors during the whole pass — expect none from the application (broken image `src` would show as a console/network error).

- [ ] **Step 5: Fix any bugs found**

If Steps 1–4 reveal any issue, fix it directly, re-run the affected step(s), and commit the fix:

```bash
git add -A
git commit -m "fix: <describe the bug fixed during guide-photo-cards verification>"
```

If Steps 1–4 pass cleanly, skip this step — nothing to commit.
