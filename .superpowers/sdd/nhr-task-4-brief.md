### Task 4: Home category section — `CategoryShowcase`, remove `CategoryGrid`/`GuideLinksSection`

**Files:**
- Create: `components/home/CategoryShowcase.tsx`
- Delete: `components/home/CategoryGrid.tsx`
- Delete: `components/home/GuideLinksSection.tsx`
- Delete: `lib/branch-images.ts`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `topBestsellers(products, category, limit)` from Task 1; `GUIDE_LINKS` from `@/lib/guide-links`; `findCategoryBySlugPath` from `@/lib/category-tree`; `ProductCard` from `@/components/shop/ProductCard` (existing, unchanged — takes a single `product: Product` prop).

- [ ] **Step 1: Delete the superseded files**

```bash
git rm components/home/CategoryGrid.tsx components/home/GuideLinksSection.tsx lib/branch-images.ts
```

(`lib/branch-images.ts` is only ever imported by these two files and by `components/layout/Navbar.tsx` — which Task 2 already stopped importing it from. After this step it has zero remaining consumers.)

- [ ] **Step 2: Create `CategoryShowcase.tsx`**

Create `components/home/CategoryShowcase.tsx`:

```tsx
import Image from 'next/image'
import Link from 'next/link'
import productsData from '@/data/products.json'
import categoriesData from '@/data/categories.json'
import type { Product, Category } from '@/lib/types'
import { GUIDE_LINKS } from '@/lib/guide-links'
import { findCategoryBySlugPath } from '@/lib/category-tree'
import { topBestsellers } from '@/lib/reviews'
import ProductCard from '@/components/shop/ProductCard'

const products = productsData as Product[]
const categories = categoriesData as Category[]

function categoryForHref(href: string): Category | undefined {
  const slugPath = href.replace('/shop/', '').split('/')
  return findCategoryBySlugPath(categories, slugPath)
}

export default function CategoryShowcase() {
  const rows = GUIDE_LINKS.slice(0, 4).map(link => ({
    link,
    products: topBestsellers(products, categoryForHref(link.href), 6),
  }))

  return (
    <section className="py-20 bg-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-black text-center mb-12">
          Scegli la tua <em className="text-red">categoria</em>
        </h2>
        <div className="space-y-10">
          {rows.map(({ link, products: rowProducts }) => (
            <div key={link.href} className="flex flex-col lg:flex-row gap-6">
              <Link
                href={link.href}
                className="group relative shrink-0 w-full lg:w-64 aspect-[4/3] lg:aspect-auto rounded-2xl overflow-hidden"
              >
                <Image
                  src={link.image}
                  alt={link.label}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white text-xl font-black">{link.label}</p>
                  <p className="text-white/80 text-xs font-semibold mt-1">Vai ai prodotti →</p>
                </div>
              </Link>
              <div className="flex-1 flex gap-5 overflow-x-auto pb-2">
                {rowProducts.map(p => (
                  <div key={p.id} className="w-56 shrink-0">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Wire into the home page, remove `GuideLinksSection`**

Replace the entire contents of `app/page.tsx` with:

```tsx
import HeroSection from '@/components/home/HeroSection'
import CategoryShowcase from '@/components/home/CategoryShowcase'
import NewArrivalsCarousel from '@/components/home/NewArrivalsCarousel'
import BestsellersSection from '@/components/home/BestsellersSection'
import TrustSection from '@/components/home/TrustSection'
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel'
import BrandCarousel from '@/components/home/BrandCarousel'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryShowcase />
      <NewArrivalsCarousel />
      <BestsellersSection />
      <TrustSection />
      <TestimonialsCarousel />
      <BrandCarousel />
    </>
  )
}
```

- [ ] **Step 4: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds, no dangling imports of the deleted files anywhere (search first: `grep -rn "CategoryGrid\|GuideLinksSection\|branch-images" --include="*.tsx" --include="*.ts" . | grep -v node_modules` should return nothing).

Run: `npm test`
Expected: all tests pass (`__tests__/guide-links.test.ts` and others are unaffected — none of them reference the deleted files).

- [ ] **Step 5: Commit**

```bash
git add -A components/home/CategoryShowcase.tsx components/home/CategoryGrid.tsx components/home/GuideLinksSection.tsx lib/branch-images.ts app/page.tsx
git commit -m "feat: replace home category grid with promo-tile + bestseller product rows"
```

---

