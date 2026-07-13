### Task 8: `/prodotto/[slug]` route (replaces `/shop/[slug]`)

**Files:**
- Create: `app/prodotto/[slug]/page.tsx`
- Delete: `app/shop/[slug]/page.tsx` (and the now-empty `app/shop/[slug]/` directory)

**Interfaces:**
- Consumes: `data/products.json` (Task 4), `ProductGallery`/`ProductInfo`/`ProductTabs` (Task 7, unchanged prop contracts)

- [ ] **Step 1: Create `app/prodotto/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import allProducts from '@/data/products.json'
import type { Product } from '@/lib/types'
import ProductGallery from '@/components/product/ProductGallery'
import ProductInfo from '@/components/product/ProductInfo'
import ProductTabs from '@/components/product/ProductTabs'

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return (allProducts as Product[]).map(p => ({ slug: p.slug }))
}

export default function ProductPage({ params }: Props) {
  const product = (allProducts as Product[]).find(p => p.slug === params.slug)
  if (!product) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductGallery images={product.images} name={product.name} />
        <ProductInfo product={product} />
      </div>
      <ProductTabs description={product.description} specs={product.specs} />
    </div>
  )
}
```

- [ ] **Step 2: Delete the old route**

```bash
git rm app/shop/[slug]/page.tsx
```

- [ ] **Step 3: Verify with the dev server**

Run: `npm run dev` (in background), then `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/prodotto/acavallo-sapone-per-il-cuoio-alla-mandorla-500ml-glicerina`
Expected: `200`. Stop the dev server after checking.

- [ ] **Step 4: Commit**

```bash
git add app/prodotto
git commit -m "feat: move product detail to /prodotto/[slug] matching the real site"
```

---

