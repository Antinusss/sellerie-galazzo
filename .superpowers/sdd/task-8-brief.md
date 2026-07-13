### Task 8: Cart Page

**Files:**
- Create: `components/cart/CartItem.tsx`
- Create: `components/cart/CartSummary.tsx`
- Create: `app/cart/page.tsx`

- [ ] **Step 1: Create CartItem**

Create `components/cart/CartItem.tsx`:

```typescript
'use client'
import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import type { CartItem as CartItemType } from '@/lib/types'

interface CartItemProps { item: CartItemType }

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCartStore()
  return (
    <div className="flex gap-4 py-5 border-b border-gray-100">
      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-light shrink-0">
        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-sand font-semibold uppercase">{item.product.category}</p>
        <p className="font-bold text-sm leading-tight mt-0.5">{item.product.name}</p>
        <p className="text-gray-400 text-xs mt-0.5">{item.product.brand}</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center border border-gray-200 rounded-full overflow-hidden text-sm">
            <button
              onClick={() => item.quantity > 1 ? updateQuantity(item.product.id, item.quantity - 1) : removeItem(item.product.id)}
              className="px-3 py-1 hover:bg-gray-light"
            >
              <Minus size={12} />
            </button>
            <span className="px-3 font-bold">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              className="px-3 py-1 hover:bg-gray-light"
            >
              <Plus size={12} />
            </button>
          </div>
          <button
            onClick={() => removeItem(item.product.id)}
            className="text-gray-300 hover:text-red transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-black">{formatPrice(item.product.price * item.quantity)}</p>
        {item.quantity > 1 && (
          <p className="text-xs text-gray-400">{formatPrice(item.product.price)} cad.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create CartSummary**

Create `components/cart/CartSummary.tsx`:

```typescript
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

export default function CartSummary() {
  const { totalPrice } = useCartStore()
  const [coupon, setCoupon] = useState('')
  const shipping = totalPrice >= 8000 ? 0 : 590
  const total = totalPrice + shipping

  return (
    <div className="bg-gray-light rounded-2xl p-6 sticky top-28">
      <h3 className="font-black text-lg mb-6">Riepilogo ordine</h3>

      <div className="space-y-3 text-sm mb-6">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotale</span>
          <span className="font-semibold">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Spedizione</span>
          <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
            {shipping === 0 ? 'Gratuita' : formatPrice(shipping)}
          </span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-gray-400">Aggiungi {formatPrice(8000 - totalPrice)} per la spedizione gratuita</p>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <input
          value={coupon}
          onChange={e => setCoupon(e.target.value)}
          placeholder="Codice sconto"
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-sand"
        />
        <button className="border border-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-black hover:text-white transition-colors">
          Applica
        </button>
      </div>

      <div className="border-t border-gray-300 pt-4 mb-6">
        <div className="flex justify-between font-black text-lg">
          <span>Totale</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="block w-full bg-red text-white text-center py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
      >
        Procedi al checkout
      </Link>
    </div>
  )
}
```

- [ ] **Step 3: Create cart page**

Create `app/cart/page.tsx`:

```typescript
'use client'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import CartItem from '@/components/cart/CartItem'
import CartSummary from '@/components/cart/CartSummary'

export default function CartPage() {
  const items = useCartStore(s => s.items)

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
        <h1 className="text-3xl font-black mb-3">Il tuo carrello è vuoto</h1>
        <p className="text-gray-400 mb-8">Aggiungi qualcosa di bello per i tuoi cavalli e per te.</p>
        <Link
          href="/shop"
          className="inline-block bg-red text-white px-8 py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
        >
          Vai allo shop
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-black mb-10">
        Il tuo <em className="font-serif text-red not-italic">carrello</em>
      </h1>
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1">
          {items.map(item => <CartItem key={item.product.id} item={item} />)}
        </div>
        <div className="lg:w-80">
          <CartSummary />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify cart**

Add a product from shop, go to `/cart` — item shows, qty works, empty state works.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: cart page with items, quantity control, summary"
```

---

