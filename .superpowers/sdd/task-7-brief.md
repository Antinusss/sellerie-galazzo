### Task 7: Product Detail Page

**Files:**
- Create: `components/product/ProductGallery.tsx`
- Create: `components/product/ProductInfo.tsx`
- Create: `components/product/ProductTabs.tsx`
- Create: `app/shop/[slug]/page.tsx`

- [ ] **Step 1: Create ProductGallery**

Create `components/product/ProductGallery.tsx`:

```typescript
'use client'
import { useState } from 'react'
import Image from 'next/image'

interface ProductGalleryProps { images: string[]; name: string }

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)
  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-light">
        <Image src={images[selected]} alt={name} fill className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                selected === i ? 'border-red' : 'border-transparent hover:border-sand'
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create ProductInfo**

Create `components/product/ProductInfo.tsx`:

```typescript
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
  const addItem = useCartStore(s => s.addItem)

  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  const handleAdd = () => {
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sand font-bold uppercase text-xs tracking-widest mb-2">{product.category}</p>
        <h1 className="text-3xl lg:text-4xl font-black text-black leading-tight">{product.name}</h1>
        <p className="text-gray-400 text-sm mt-1">{product.brand}</p>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black">{formatPrice(product.price)}</span>
        {product.originalPrice && (
          <>
            <span className="text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
            <span className="bg-red text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discountPct}%</span>
          </>
        )}
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

- [ ] **Step 3: Create ProductTabs**

Create `components/product/ProductTabs.tsx`:

```typescript
'use client'
import { useState } from 'react'

interface ProductTabsProps { description: string; specs: string }

const TABS = ['Descrizione', 'Specifiche', 'Spedizione & Resi'] as const

export default function ProductTabs({ description, specs }: ProductTabsProps) {
  const [active, setActive] = useState<typeof TABS[number]>('Descrizione')

  const content: Record<typeof TABS[number], React.ReactNode> = {
    'Descrizione': <p className="text-gray-600 leading-relaxed">{description}</p>,
    'Specifiche': (
      <div className="space-y-2">
        {specs.split(' | ').map(spec => {
          const [key, val] = spec.split(': ')
          return (
            <div key={spec} className="flex gap-4 py-2 border-b border-gray-100">
              <span className="font-semibold text-sm w-40 shrink-0">{key}</span>
              <span className="text-sm text-gray-600">{val}</span>
            </div>
          )
        })}
      </div>
    ),
    'Spedizione & Resi': (
      <div className="space-y-4 text-sm text-gray-600">
        <p>🚚 <strong>Spedizione standard:</strong> 3-5 giorni lavorativi. Gratuita sopra €80, altrimenti €5,90.</p>
        <p>⚡ <strong>Spedizione express:</strong> 1-2 giorni lavorativi. €9,90.</p>
        <p>↩️ <strong>Resi:</strong> Gratuiti entro 30 giorni dall'acquisto. Prodotto integro e imballato.</p>
      </div>
    ),
  }

  return (
    <div className="mt-12">
      <div className="flex gap-0 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              active === tab ? 'border-red text-red' : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="py-6">{content[active]}</div>
    </div>
  )
}
```

- [ ] **Step 4: Create product detail route**

Create `app/shop/[slug]/page.tsx`:

```typescript
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

- [ ] **Step 5: Verify product page**

Open `http://localhost:3000/shop/equestro-cap-apocalypse` — gallery, info, tabs, add to cart all work.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: product detail page with gallery, info, tabs, add-to-cart"
```

---

