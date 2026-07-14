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
