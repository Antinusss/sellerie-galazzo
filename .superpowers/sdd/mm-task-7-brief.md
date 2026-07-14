### Task 7: `/brand/[slug]` page — one brand's products, paginated

**Files:**
- Create: `app/brand/[slug]/page.tsx`

**Interfaces:**
- Consumes: `PaginatedProductGrid` (Task 3), `data/brands.json` with `logo` (Task 2)

- [ ] **Step 1: Create `app/brand/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import allProducts from '@/data/products.json'
import allBrands from '@/data/brands.json'
import type { Product, Brand } from '@/lib/types'
import PaginatedProductGrid from '@/components/shop/PaginatedProductGrid'

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return (allBrands as Brand[]).map(b => ({ slug: b.id }))
}

export default function BrandPage({ params }: Props) {
  const brand = (allBrands as Brand[]).find(b => b.id === params.slug)
  if (!brand) notFound()

  const products = (allProducts as Product[]).filter(p => p.brand === brand.name)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        {brand.logo && (
          <div className="relative w-16 h-16 shrink-0">
            <Image src={brand.logo} alt={brand.name} fill className="object-contain" />
          </div>
        )}
        <div>
          <h1 className="text-4xl font-black">{brand.name}</h1>
          <p className="text-sm text-gray-400">{products.length} prodotti</p>
        </div>
      </div>
      <PaginatedProductGrid products={products} />
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
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/brand/equestro
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/brand/tommy-hilfiger
```

Expected: `200` for both. Stop the dev server after checking.

- [ ] **Step 4: Commit**

```bash
git add app/brand
git commit -m "feat: add /brand/[slug] page, one per brand"
```

---

