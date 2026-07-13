'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import allProducts from '@/data/products.json'
import type { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

const products = allProducts as Product[]

interface SearchOverlayProps {
  onClose: () => void
}

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const q = query.trim().toLowerCase()
  const results = q
    ? products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8)
    : []

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <Search size={20} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cerca un prodotto..."
              className="flex-1 outline-none text-sm"
            />
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-black transition-colors">
              <X size={18} />
            </button>
          </div>

          {q && (
            <div className="max-h-[60vh] overflow-y-auto">
              {results.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-gray-400">
                  Nessun prodotto trovato per &quot;{query}&quot;
                </p>
              ) : (
                results.map(p => (
                  <Link
                    key={p.id}
                    href={`/prodotto/${p.slug}`}
                    onClick={onClose}
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
      </div>
    </div>
  )
}
