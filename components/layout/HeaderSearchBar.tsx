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
