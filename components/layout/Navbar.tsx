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

const SearchOverlay = dynamic(() => import('./SearchOverlay'), { ssr: false })

const categories = categoriesData as Category[]
const brands = brandsData as Brand[]
const products = productsData as Product[]
const topLevel = getChildren(categories, undefined)
const topBrands = [...brands].sort((a, b) => b.productCount - a.productCount).slice(0, 12)
const featuredByBranch = new Map(topLevel.map(cat => [cat.name, topBestsellers(products, cat, 4)]))

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [activeMid, setActiveMid] = useState<Record<string, string>>({})
  const { totalItems, openCart } = useCartStore()
  const { productIds: wishlistIds } = useWishlistStore()
  const { user } = useAuthStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className="fixed top-8 left-0 right-0 z-40">
      {/* Visual background lives on this inner wrapper, not on <nav> itself:
          backdrop-filter on an ancestor creates a new containing block for
          position:fixed descendants (SearchOverlay, and formerly CartDrawer),
          which would silently break their viewport-relative positioning. */}
      <div className={`transition-all duration-300 ${
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
            <Link href="/wishlist" className="relative p-2 hover:text-red transition-colors">
              <Heart size={20} />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
            <Link href={user ? '/account' : '/account/login'} className="p-2 hover:text-red transition-colors">
              <User size={20} />
            </Link>
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

          {topLevel.map(cat => {
            const midCats = getChildren(categories, cat).filter(mid => getChildren(categories, mid).length > 0)
            const activeMidSlug = activeMid[cat.name] ?? midCats[0]?.slug.join('/')
            const activeMidCat = midCats.find(m => m.slug.join('/') === activeMidSlug)
            const featured = featuredByBranch.get(cat.name) ?? []

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
            <Link href="/guida-ai-prodotti" className="text-sm font-medium text-black hover:text-red transition-colors h-12 inline-flex items-center">
              Guida ai prodotti
            </Link>
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
      </div>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </nav>
  )
}
