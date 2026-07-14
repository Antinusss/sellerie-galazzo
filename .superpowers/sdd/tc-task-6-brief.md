### Task 6: Reviews + Klarna badge + cart-drawer trigger on ProductInfo

**Files:**
- Modify: `components/product/ProductInfo.tsx`

**Interfaces:**
- Consumes: `getReviewSummary` (Task 3), `openCart` from `useCartStore` (Task 1)

- [ ] **Step 1: Rewrite `components/product/ProductInfo.tsx`**

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Heart, Minus, Plus, ShoppingCart, Star } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { findCategoryByPath } from '@/lib/category-tree'
import { getReviewSummary } from '@/lib/reviews'
import categoriesData from '@/data/categories.json'
import type { Product, Category } from '@/lib/types'

const categories = categoriesData as Category[]

interface ProductInfoProps { product: Product }

export default function ProductInfo({ product }: ProductInfoProps) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem, openCart } = useCartStore()
  const breadcrumbSlug = findCategoryByPath(categories, product.categoryPath)?.slug ?? []
  const { rating, count } = getReviewSummary(product.id)

  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  const handleAdd = () => {
    addItem(product, qty)
    openCart()
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
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
        <h1 className="text-3xl lg:text-4xl font-black text-black leading-tight">{product.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} size={16} className={i < Math.round(rating) ? 'fill-sand text-sand' : 'text-gray-200'} />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-600">{rating.toFixed(1)}</span>
          <span className="text-sm text-gray-400">({count} recensioni)</span>
        </div>
        {product.brand && <p className="text-gray-400 text-sm mt-1">{product.brand}</p>}
      </div>

      <div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <>
              <span className="text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
              <span className="bg-red text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discountPct}%</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
          <span className="bg-[#FFB3C7] text-black font-black text-[10px] px-1.5 py-0.5 rounded">Klarna</span>
          <span>Paga in 3 rate da {formatPrice(Math.round(product.price / 3))} senza interessi</span>
        </div>
      </div>

      {/* Qty */}
      <div>
        <p className="text-sm font-semibold mb-3">Quantità</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center border-2 border-gray-200 rounded-full overflow-hidden">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-4 py-2 hover:bg-gray-light transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="px-4 font-bold">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="px-4 py-2 hover:bg-gray-light transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleAdd}
          className={`w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-colors ${
            added ? 'bg-green-600 text-white' : 'bg-red text-white hover:bg-red-dark'
          }`}
        >
          <ShoppingCart size={20} />
          {added ? 'Aggiunto al carrello ✓' : 'Aggiungi al carrello'}
        </button>
        <button className="w-full py-4 rounded-full font-bold border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2">
          <Heart size={20} />
          Aggiungi alla wishlist
        </button>
      </div>

      {/* Trust mini */}
      <div className="border-t border-gray-100 pt-4 grid grid-cols-3 gap-2 text-center text-xs text-gray-400">
        <div>🚚 Spedizione gratuita<br/>sopra €80</div>
        <div>↩️ Reso gratuito<br/>30 giorni</div>
        <div>🔒 Pagamento<br/>sicuro</div>
      </div>
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
curl -s http://localhost:3000/prodotto/acavallo-sapone-per-il-cuoio-alla-mandorla-500ml-glicerina | grep -o "Klarna" | head -1
```

Expected: prints `Klarna`. Stop the dev server after checking.

- [ ] **Step 4: Commit**

```bash
git add components/product/ProductInfo.tsx
git commit -m "feat: review stars, Klarna badge, cart-drawer trigger on ProductInfo"
```

---

