'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Search, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import categoriesData from '@/data/categories.json'
import type { Category } from '@/lib/types'
import { getChildren } from '@/lib/category-tree'

const SearchOverlay = dynamic(() => import('./SearchOverlay'), { ssr: false })

const categories = categoriesData as Category[]
const topLevel = getChildren(categories, undefined)

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
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
            <button className="p-2 hover:text-red transition-colors" onClick={() => setSearchOpen(true)}>
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

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </nav>
  )
}
