### Task 6: Real logo + real category links in Navbar and Footer

**Files:**
- Modify: `components/layout/Navbar.tsx`
- Modify: `components/layout/Footer.tsx`

**Interfaces:**
- Consumes: `getChildren` from `lib/category-tree` (Task 3), `Category` from `lib/types` (Task 1), `data/categories.json` (Task 4), `public/logo-selleria-galazzo.png` (Task 4)

- [ ] **Step 1: Rewrite `components/layout/Navbar.tsx`**

```tsx
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Search, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import categoriesData from '@/data/categories.json'
import type { Category } from '@/lib/types'
import { getChildren } from '@/lib/category-tree'

const categories = categoriesData as Category[]
const topLevel = getChildren(categories, undefined)

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { totalItems } = useCartStore()

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

          <div className="hidden md:flex items-center gap-8">
            {topLevel.map(cat => (
              <div key={cat.slug.join('/')} className="group relative">
                <Link
                  href={`/shop/${cat.slug.join('/')}`}
                  className="text-sm font-medium text-black hover:text-red transition-colors py-6 inline-block"
                >
                  {cat.name}
                </Link>
                <div className="absolute left-0 top-full hidden group-hover:flex flex-col bg-white shadow-lg rounded-xl py-2 min-w-[220px] z-50">
                  {getChildren(categories, cat).map(child => (
                    <Link
                      key={child.slug.join('/')}
                      href={`/shop/${child.slug.join('/')}`}
                      className="px-4 py-2 text-sm text-black hover:bg-gray-light hover:text-red transition-colors"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:text-red transition-colors">
              <Search size={20} />
            </button>
            <button className="p-2 hover:text-red transition-colors">
              <Heart size={20} />
            </button>
            <Link href="/cart" className="relative p-2 hover:text-red transition-colors">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
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
          </div>
        )}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Rewrite `components/layout/Footer.tsx`**

The logo art is black-on-transparent, so on the black footer it needs a white chip behind it to stay visible:

```tsx
import Link from 'next/link'
import Image from 'next/image'
import { Globe, Share2, Mail } from 'lucide-react'
import categoriesData from '@/data/categories.json'
import type { Category } from '@/lib/types'
import { getChildren } from '@/lib/category-tree'

const topLevel = getChildren(categoriesData as Category[], undefined)

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="relative h-12 w-[112px] bg-white rounded-lg p-2 mb-3">
              <Image src="/logo-selleria-galazzo.png" alt="Selleria Galazzo" fill className="object-contain p-1" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Selleria online specializzata in articoli per equitazione e abbigliamento tecnico per cavallo e cavaliere.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Globe size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Share2 size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Mail size={20} /></a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sand">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {topLevel.map(cat => (
                <li key={cat.slug.join('/')}>
                  <Link href={`/shop/${cat.slug.join('/')}`} className="hover:text-white transition-colors">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sand">Assistenza</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Contattaci', 'Spedizioni', 'Resi e rimborsi', 'FAQ', 'Guida alle taglie'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sand">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">Novità, offerte esclusive e consigli per cavalieri.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="La tua email"
                className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sand"
              />
              <button className="bg-red text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-dark transition-colors">
                OK
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 Selleria Galazzo di Biag Galazzo. Tutti i diritti riservati.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white transition-colors">P.IVA 00000000000</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/layout/Navbar.tsx components/layout/Footer.tsx
git commit -m "feat: real logo and category-driven nav in Navbar/Footer"
```

---

