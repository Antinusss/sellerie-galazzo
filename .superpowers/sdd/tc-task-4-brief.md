### Task 4: Cart drawer + Navbar restructure (two rows, header search bar, cart trigger)

**Files:**
- Create: `components/cart/CartDrawer.tsx`
- Create: `components/layout/HeaderSearchBar.tsx`
- Modify: `components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: `useCartStore` (`isCartOpen`, `closeCart`, `openCart`, `items`, `totalItems`, `totalPrice`, `removeItem`, `updateQuantity` — all from Task 1), `searchProducts` (Task 2)

- [ ] **Step 1: Create `components/cart/CartDrawer.tsx`**

```tsx
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

export default function CartDrawer() {
  const { items, totalItems, totalPrice, isCartOpen, closeCart, removeItem, updateQuantity } = useCartStore()

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} />
      <aside
        className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-black text-lg">Carrello ({totalItems})</h2>
          <button onClick={closeCart} className="p-1 text-gray-400 hover:text-black transition-colors">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <ShoppingBag size={48} className="text-gray-200 mb-4" />
            <p className="font-bold mb-1">Il carrello è vuoto</p>
            <p className="text-sm text-gray-400 mb-6">Aggiungi qualcosa di bello per i tuoi cavalli.</p>
            <button onClick={closeCart} className="text-red font-semibold text-sm hover:text-red-dark">
              Continua lo shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-light shrink-0">
                    <Image src={item.product.images[0] ?? ''} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold line-clamp-2">{item.product.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatPrice(item.product.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden text-xs">
                        <button
                          onClick={() => item.quantity > 1 ? updateQuantity(item.product.id, item.quantity - 1) : removeItem(item.product.id)}
                          className="px-2 py-1 hover:bg-gray-light"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="px-2 font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-gray-light"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.product.id)} className="text-gray-300 hover:text-red transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-black shrink-0">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="px-6 py-5 border-t border-gray-100">
              <div className="flex justify-between font-black text-lg mb-4">
                <span>Subtotale</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full text-center border-2 border-black py-3 rounded-full font-bold text-sm hover:bg-black hover:text-white transition-colors"
                >
                  Vai al carrello
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full text-center bg-red text-white py-3 rounded-full font-bold text-sm hover:bg-red-dark transition-colors"
                >
                  Vai al checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/layout/HeaderSearchBar.tsx`**

```tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'
import allProducts from '@/data/products.json'
import type { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { searchProducts } from '@/lib/search'

const products = allProducts as Product[]

export default function HeaderSearchBar() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const results = searchProducts(products, query)

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md mx-6 hidden md:block">
      <div className="flex items-center gap-2 bg-gray-light rounded-full px-4 py-2">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Cerca un prodotto..."
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      {open && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl overflow-hidden max-h-[60vh] overflow-y-auto z-50">
          {results.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-gray-400">
              Nessun prodotto trovato per &quot;{query}&quot;
            </p>
          ) : (
            results.map(p => (
              <Link
                key={p.id}
                href={`/prodotto/${p.slug}`}
                onClick={() => { setOpen(false); setQuery('') }}
                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-light transition-colors"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-light shrink-0">
                  <Image src={p.images[0] ?? ''} alt={p.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.category}</p>
                </div>
                <p className="text-sm font-bold text-black shrink-0">{formatPrice(p.price)}</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Rewrite `components/layout/Navbar.tsx`**

```tsx
'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Search, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import categoriesData from '@/data/categories.json'
import brandsData from '@/data/brands.json'
import type { Category, Brand } from '@/lib/types'
import { getChildren } from '@/lib/category-tree'
import { BRANCH_IMAGES } from '@/lib/branch-images'
import HeaderSearchBar from './HeaderSearchBar'
import CartDrawer from '@/components/cart/CartDrawer'

const SearchOverlay = dynamic(() => import('./SearchOverlay'), { ssr: false })

const categories = categoriesData as Category[]
const brands = brandsData as Brand[]
const topLevel = getChildren(categories, undefined)
const topBrands = [...brands].sort((a, b) => b.productCount - a.productCount).slice(0, 12)

const GUIDE_LINKS = [
  { label: 'Cura del cavallo', href: '/shop/scuderia/cura-del-cavallo' },
  { label: 'Cura del cuoio', href: '/shop/scuderia/cura-del-cuoio' },
  { label: 'Attrezzatura da scuderia', href: '/shop/scuderia/attrezzatura-da-scuderia' },
  { label: 'Selle e accessori (Inglese)', href: '/shop/monta-inglese/cavallo/selle-e-accessori' },
  { label: 'Coperte', href: '/shop/monta-inglese/cavallo/coperte' },
  { label: 'Protezioni', href: '/shop/monta-inglese/cavallo/protezioni' },
  { label: 'Selle e accessori (Western)', href: '/shop/monta-western/cavallo/selle-e-accessori' },
  { label: 'Briglie e accessori', href: '/shop/monta-inglese/cavallo/briglie-e-accessori' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { totalItems, openCart } = useCartStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-8 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex-shrink-0 relative h-10 w-[93px]">
            <Image src="/logo-selleria-galazzo.png" alt="Selleria Galazzo" fill className="object-contain object-left" priority />
          </Link>

          <HeaderSearchBar />

          <div className="flex items-center gap-4">
            <button className="p-2 hover:text-red transition-colors md:hidden" onClick={() => setSearchOpen(true)}>
              <Search size={20} />
            </button>
            <button className="p-2 hover:text-red transition-colors">
              <Heart size={20} />
            </button>
            <button className="relative p-2 hover:text-red transition-colors" onClick={openCart}>
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 h-12 border-t border-gray-100">
          {topLevel.map(cat => (
            <div key={cat.slug.join('/')} className="group relative">
              <Link
                href={`/shop/${cat.slug.join('/')}`}
                className="text-sm font-medium text-black hover:text-red transition-colors h-12 inline-flex items-center"
              >
                {cat.name}
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:flex bg-white shadow-lg rounded-xl p-6 gap-8 z-50 w-max max-w-3xl">
                <div className="flex gap-8">
                  {getChildren(categories, cat).map(mid => (
                    <div key={mid.slug.join('/')} className="min-w-[160px]">
                      <Link
                        href={`/shop/${mid.slug.join('/')}`}
                        className="block text-xs font-bold uppercase tracking-wide text-black hover:text-red transition-colors mb-3"
                      >
                        {mid.name}
                      </Link>
                      <div className="flex flex-col gap-2">
                        {getChildren(categories, mid).map(leaf => (
                          <Link
                            key={leaf.slug.join('/')}
                            href={`/shop/${leaf.slug.join('/')}`}
                            className="text-sm text-gray-600 hover:text-red transition-colors"
                          >
                            {leaf.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/shop/${cat.slug.join('/')}`}
                  className="relative w-48 shrink-0 rounded-xl overflow-hidden group/promo"
                >
                  <Image
                    src={BRANCH_IMAGES[cat.name] ?? cat.image ?? ''}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover/promo:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-black text-lg">{cat.name}</p>
                    <p className="text-white/80 text-xs font-semibold mt-1">Scopri tutto →</p>
                  </div>
                </Link>
              </div>
            </div>
          ))}

          <div className="group relative">
            <Link href="/marche" className="text-sm font-medium text-black hover:text-red transition-colors h-12 inline-flex items-center">
              Marche
            </Link>
            <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:block bg-white shadow-lg rounded-xl p-6 z-50 w-[420px]">
              <div className="grid grid-cols-4 gap-4">
                {topBrands.map(brand => (
                  <Link
                    key={brand.id}
                    href={`/brand/${brand.id}`}
                    className="flex flex-col items-center gap-2 text-center group/brand"
                  >
                    {brand.logo ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-light">
                        <Image src={brand.logo} alt={brand.name} fill className="object-contain p-1" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-light flex items-center justify-center text-xs font-black text-gray-400">
                        {brand.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs text-black group-hover/brand:text-red transition-colors leading-tight">{brand.name}</span>
                  </Link>
                ))}
              </div>
              <Link href="/marche" className="block text-center text-sm font-semibold text-red mt-4 hover:text-red-dark">
                Vedi tutti i marchi →
              </Link>
            </div>
          </div>

          <Link href="/offerte" className="text-sm font-medium text-red hover:text-red-dark transition-colors h-12 inline-flex items-center">
            Offerte
          </Link>

          <div className="group relative">
            <span className="text-sm font-medium text-black h-12 inline-flex items-center cursor-default">
              Guida ai prodotti
            </span>
            <div className="absolute right-0 top-full hidden group-hover:block bg-white shadow-lg rounded-xl p-6 z-50 w-64">
              <div className="flex flex-col gap-2">
                {GUIDE_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-black hover:text-red transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            {topLevel.map(cat => (
              <Link
                key={cat.slug.join('/')}
                href={`/shop/${cat.slug.join('/')}`}
                className="block py-3 text-sm font-medium text-black hover:text-red"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <Link href="/marche" className="block py-3 text-sm font-medium text-black hover:text-red" onClick={() => setMobileOpen(false)}>
              Marche
            </Link>
            <Link href="/offerte" className="block py-3 text-sm font-medium text-red hover:text-red-dark" onClick={() => setMobileOpen(false)}>
              Offerte
            </Link>
          </div>
        )}
      </div>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      <CartDrawer />
    </nav>
  )
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 5: Verify with the dev server**

Run: `npm run dev` (in background), then:

```bash
curl -s http://localhost:3000/ | grep -o 'Cerca un prodotto' | head -1
```

Expected: prints `Cerca un prodotto` (confirms the new header search bar's placeholder is in the markup). Stop the dev server after checking.

- [ ] **Step 6: Commit**

```bash
git add components/cart/CartDrawer.tsx components/layout/HeaderSearchBar.tsx components/layout/Navbar.tsx
git commit -m "feat: cart drawer + two-row navbar with always-visible search"
```

---

