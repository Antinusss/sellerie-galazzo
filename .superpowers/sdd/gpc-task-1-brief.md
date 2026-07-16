### Task 1: Add a real representative image to each guide link

**Files:**
- Modify: `lib/guide-links.ts`
- Test: `__tests__/guide-links.test.ts`

**Interfaces:**
- Produces: `GUIDE_LINKS: { label: string; href: string; image: string }[]` (the `image` field is new; `label`/`href` unchanged) — consumed by `components/layout/Navbar.tsx` (already imports `GUIDE_LINKS`, ignores the new field), `app/guida-ai-prodotti/page.tsx` (next task), and `components/home/GuideLinksSection.tsx` (later task).

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
