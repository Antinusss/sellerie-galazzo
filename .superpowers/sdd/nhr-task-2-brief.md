### Task 2: Mega menu 3-column interactive panel

**Files:**
- Modify: `components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: `topBestsellers(products, category, limit)` from Task 1.

- [ ] **Step 1: Update imports and add local state**

Replace this import block (lines 1–16 of `components/layout/Navbar.tsx`):

```tsx
'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Search, User, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'
import { useAuthStore } from '@/lib/auth-store'
import categoriesData from '@/data/categories.json'
import brandsData from '@/data/brands.json'
import type { Category, Brand } from '@/lib/types'
import { getChildren } from '@/lib/category-tree'
import { BRANCH_IMAGES } from '@/lib/branch-images'
import { GUIDE_LINKS } from '@/lib/guide-links'
import HeaderSearchBar from './HeaderSearchBar'
```

with:

```tsx
'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Search, User, Menu, X, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'
import { useAuthStore } from '@/lib/auth-store'
import categoriesData from '@/data/categories.json'
import brandsData from '@/data/brands.json'
import productsData from '@/data/products.json'
import type { Category, Brand, Product } from '@/lib/types'
import { getChildren } from '@/lib/category-tree'
import { topBestsellers } from '@/lib/reviews'
import { formatPrice } from '@/lib/utils'
import { GUIDE_LINKS } from '@/lib/guide-links'
import HeaderSearchBar from './HeaderSearchBar'
```

Replace this line (originally line 21):

```tsx
const brands = brandsData as Brand[]
```

with:

```tsx
const brands = brandsData as Brand[]
const products = productsData as Product[]
```

Replace this state block (originally lines 26–29):

```tsx
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
```

with:

```tsx
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [activeMid, setActiveMid] = useState<Record<string, string>>({})
```

- [ ] **Step 2: Reset the sidebar selection when a top-nav category opens**

Replace this block (originally lines 86–100):

```tsx
        <div className="hidden md:flex items-center justify-between h-12 border-t border-gray-100 relative">
          {topLevel.map(cat => (
            <div
              key={cat.slug.join('/')}
              onMouseEnter={() => setOpenCategory(cat.name)}
              onMouseLeave={() => setOpenCategory(null)}
            >
              <Link
                href={`/shop/${cat.slug.join('/')}`}
                className="text-sm font-medium text-black hover:text-red transition-colors h-12 inline-flex items-center"
              >
                {cat.name}
              </Link>
            </div>
          ))}
```

with:

```tsx
        <div className="hidden md:flex items-center justify-between h-12 border-t border-gray-100 relative">
          {topLevel.map(cat => (
            <div
              key={cat.slug.join('/')}
              onMouseEnter={() => { setOpenCategory(cat.name); setActiveMid({}) }}
              onMouseLeave={() => setOpenCategory(null)}
            >
              <Link
                href={`/shop/${cat.slug.join('/')}`}
                className="text-sm font-medium text-black hover:text-red transition-colors h-12 inline-flex items-center"
              >
                {cat.name}
              </Link>
            </div>
          ))}
```

- [ ] **Step 3: Replace the panel with the 3-column layout**

Replace this entire block (originally lines 102–153):

```tsx
          {topLevel.map(cat => (
            <div
              key={`panel-${cat.slug.join('/')}`}
              onMouseEnter={() => setOpenCategory(cat.name)}
              onMouseLeave={() => setOpenCategory(null)}
              className={`absolute left-0 right-0 top-full bg-white shadow-lg border-t border-gray-100 rounded-b-xl z-50 ${
                openCategory === cat.name ? 'block' : 'hidden'
              }`}
            >
              <div className="flex gap-10 p-8">
                <div className="flex-1 flex gap-16">
                  {getChildren(categories, cat).filter(mid => getChildren(categories, mid).length > 0).map(mid => (
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
                  className="relative w-64 shrink-0 rounded-xl overflow-hidden group/promo"
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
```

with:

```tsx
          {topLevel.map(cat => {
            const midCats = getChildren(categories, cat).filter(mid => getChildren(categories, mid).length > 0)
            const activeMidSlug = activeMid[cat.name] ?? midCats[0]?.slug.join('/')
            const activeMidCat = midCats.find(m => m.slug.join('/') === activeMidSlug)
            const featured = topBestsellers(products, cat, 4)

            return (
              <div
                key={`panel-${cat.slug.join('/')}`}
                onMouseEnter={() => setOpenCategory(cat.name)}
                onMouseLeave={() => setOpenCategory(null)}
                className={`absolute left-0 right-0 top-full bg-white shadow-lg border-t border-gray-100 rounded-b-xl z-50 ${
                  openCategory === cat.name ? 'block' : 'hidden'
                }`}
              >
                <div className="flex gap-8 p-8">
                  <div className="w-48 shrink-0 flex flex-col gap-1">
                    {midCats.map(mid => (
                      <button
                        key={mid.slug.join('/')}
                        onMouseEnter={() => setActiveMid(m => ({ ...m, [cat.name]: mid.slug.join('/') }))}
                        className={`text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          activeMidSlug === mid.slug.join('/') ? 'bg-red/10 text-red' : 'text-black hover:bg-gray-light'
                        }`}
                      >
                        {mid.name}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-3 content-start">
                    {activeMidCat && getChildren(categories, activeMidCat).map(leaf => (
                      <Link
                        key={leaf.slug.join('/')}
                        href={`/shop/${leaf.slug.join('/')}`}
                        className="flex items-center justify-between gap-2 bg-gray-light rounded-xl px-4 py-3 text-sm font-semibold text-black hover:text-red hover:bg-sand/10 transition-colors"
                      >
                        {leaf.name}
                        <ChevronRight size={14} className="shrink-0 opacity-50" />
                      </Link>
                    ))}
                  </div>

                  <div className="w-64 shrink-0">
                    <p className="text-xs font-black uppercase tracking-wide text-gray-400 mb-3">In evidenza</p>
                    <div className="flex flex-col gap-3">
                      {featured.map(p => (
                        <Link key={p.id} href={`/prodotto/${p.slug}`} className="flex gap-3 items-center group/prod">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-light shrink-0">
                            <Image src={p.images[0] ?? ''} alt={p.name} fill className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-black line-clamp-2 group-hover/prod:text-red transition-colors">{p.name}</p>
                            <p className="text-xs font-black text-red mt-0.5">{formatPrice(p.price)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
```

- [ ] **Step 4: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors (in particular, no "unused import" errors for `BRANCH_IMAGES` — it's fully removed from this file).

Run: `npm run build`
Expected: build succeeds.

Run: `npm test`
Expected: all tests still pass (this file has no dedicated test suite; this just guards against an unrelated regression).

- [ ] **Step 5: Commit**

```bash
git add components/layout/Navbar.tsx
git commit -m "feat: redesign mega menu panel to 3-column interactive layout"
```

---

