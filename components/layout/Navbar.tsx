'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Heart, Search, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'

const categories = [
  { name: 'Monta Inglese', slug: 'monta-inglese' },
  { name: 'Monta Western', slug: 'monta-western' },
  { name: 'Scuderia', slug: 'scuderia' },
  { name: 'Cavaliere', slug: 'cavaliere' },
]

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
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-black text-black tracking-tight">
              Selleria<span className="text-red">Galazzo</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="text-sm font-medium text-black hover:text-red transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Icons */}
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
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
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
