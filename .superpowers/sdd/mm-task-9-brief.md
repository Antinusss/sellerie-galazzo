### Task 9: Brand section on the product page

**Files:**
- Create: `components/product/BrandSection.tsx`
- Modify: `app/prodotto/[slug]/page.tsx`

**Interfaces:**
- Consumes: `data/brands.json` with `logo`/`id` (Task 2)

- [ ] **Step 1: Create `components/product/BrandSection.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import allBrands from '@/data/brands.json'
import type { Brand, Product } from '@/lib/types'

interface BrandSectionProps { product: Product }

export default function BrandSection({ product }: BrandSectionProps) {
  if (!product.brand) return null
  const brand = (allBrands as Brand[]).find(b => b.name === product.brand)
  if (!brand) return null

  return (
    <section className="mt-12 bg-gray-light rounded-2xl p-6 flex items-center gap-4">
      {brand.logo ? (
        <div className="relative w-14 h-14 shrink-0 bg-white rounded-full overflow-hidden">
          <Image src={brand.logo} alt={brand.name} fill className="object-contain p-2" />
        </div>
      ) : (
        <div className="w-14 h-14 shrink-0 rounded-full bg-white flex items-center justify-center text-sm font-black text-gray-400">
          {brand.name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Venduto da</p>
        <p className="font-black text-lg">{brand.name}</p>
      </div>
      <Link href={`/brand/${brand.id}`} className="text-sm font-semibold text-red hover:text-red-dark whitespace-nowrap">
        Vedi tutti i prodotti →
      </Link>
    </section>
  )
}
```

- [ ] **Step 2: Wire it into `app/prodotto/[slug]/page.tsx`**

Change:

```tsx
import ProductGallery from '@/components/product/ProductGallery'
import ProductInfo from '@/components/product/ProductInfo'
import ProductTabs from '@/components/product/ProductTabs'
import RelatedProducts from '@/components/product/RelatedProducts'
import NewsletterSection from '@/components/product/NewsletterSection'
```

to:

```tsx
import ProductGallery from '@/components/product/ProductGallery'
import ProductInfo from '@/components/product/ProductInfo'
import ProductTabs from '@/components/product/ProductTabs'
import RelatedProducts from '@/components/product/RelatedProducts'
import NewsletterSection from '@/components/product/NewsletterSection'
import BrandSection from '@/components/product/BrandSection'
```

And change:

```tsx
      <ProductTabs description={product.description} specs={product.specs} />
      <RelatedProducts product={product} />
      <NewsletterSection />
```

to:

```tsx
      <BrandSection product={product} />
      <ProductTabs description={product.description} specs={product.specs} />
      <RelatedProducts product={product} />
      <NewsletterSection />
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 4: Verify with the dev server**

Run: `npm run dev` (in background), then:

```bash
curl -s http://localhost:3000/prodotto/acavallo-sapone-per-il-cuoio-alla-mandorla-500ml-glicerina | grep -o "Venduto da"
```

Expected: prints `Venduto da` (this product has brand "Acavallo", which has a real logo from Task 2). Stop the dev server after checking.

- [ ] **Step 5: Commit**

```bash
git add components/product/BrandSection.tsx app/prodotto/\[slug\]/page.tsx
git commit -m "feat: brand section on product pages"
```

---

