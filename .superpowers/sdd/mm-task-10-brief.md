### Task 10: Clickable breadcrumbs on the product page

**Files:**
- Modify: `components/product/ProductInfo.tsx`

**Interfaces:**
- Consumes: `findCategoryByPath` from `lib/category-tree` (Task 1)

- [ ] **Step 1: Update `components/product/ProductInfo.tsx`**

Add imports and a `categories`/`breadcrumbSlug` lookup, and replace the plain category `<p>` with a linked breadcrumb `<nav>`. Change:

```tsx
'use client'
import { useState } from 'react'
import { Heart, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface ProductInfoProps { product: Product }

export default function ProductInfo({ product }: ProductInfoProps) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCartStore()
```

to:

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Heart, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { findCategoryByPath } from '@/lib/category-tree'
import categoriesData from '@/data/categories.json'
import type { Product, Category } from '@/lib/types'

const categories = categoriesData as Category[]

interface ProductInfoProps { product: Product }

export default function ProductInfo({ product }: ProductInfoProps) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCartStore()
  const breadcrumbSlug = findCategoryByPath(categories, product.categoryPath)?.slug ?? []
```

Then change:

```tsx
        <p className="text-sand font-bold uppercase text-xs tracking-widest mb-2">{product.categoryPath.join(' / ')}</p>
```

to:

```tsx
        <nav className="text-sand font-bold uppercase text-xs tracking-widest mb-2 flex flex-wrap items-center gap-1">
          {product.categoryPath.map((segment, i) => (
            <span key={segment} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-300">/</span>}
              {breadcrumbSlug.length > 0 ? (
                <Link href={`/shop/${breadcrumbSlug.slice(0, i + 1).join('/')}`} className="hover:text-red transition-colors">
                  {segment}
                </Link>
              ) : (
                <span>{segment}</span>
              )}
            </span>
          ))}
        </nav>
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 3: Verify with the dev server**

Run: `npm run dev` (in background), then:

```bash
curl -s http://localhost:3000/prodotto/acavallo-sapone-per-il-cuoio-alla-mandorla-500ml-glicerina | grep -o 'href="/shop/scuderia[^"]*"' | sort -u
```

Expected: at least `href="/shop/scuderia"` and `href="/shop/scuderia/cura-del-cuoio"` both present (this product's category is Scuderia > Cura del cuoio). Stop the dev server after checking.

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: PASS (no test covers `ProductInfo` directly, but this confirms no regressions elsewhere)

- [ ] **Step 5: Commit**

```bash
git add components/product/ProductInfo.tsx
git commit -m "feat: clickable category breadcrumbs on product pages"
```

---

