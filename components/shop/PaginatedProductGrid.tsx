'use client'
import { useEffect, useState } from 'react'
import ProductCard from '@/components/shop/ProductCard'
import type { Product } from '@/lib/types'

const PAGE_SIZE = 24

interface PaginatedProductGridProps {
  products: Product[]
}

export default function PaginatedProductGrid({ products }: PaginatedProductGridProps) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [products])

  if (products.length === 0) return null

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * PAGE_SIZE
  const pageItems = products.slice(start, start + PAGE_SIZE)

  const pageNumbers: (number | 'ellipsis')[] = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const nums = new Set<number>([1, 2, totalPages - 1, totalPages, currentPage - 1, currentPage, currentPage + 1])
    const sorted = [...nums].filter(n => n >= 1 && n <= totalPages).sort((a, b) => a - b)
    const result: (number | 'ellipsis')[] = []
    let prev = 0
    for (const n of sorted) {
      if (prev && n - prev > 1) result.push('ellipsis')
      result.push(n)
      prev = n
    }
    return result
  })()

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {pageItems.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-full text-sm font-semibold border-2 border-gray-200 disabled:opacity-40 hover:border-red hover:text-red transition-colors"
          >
            ← Precedente
          </button>
          {pageNumbers.map((n, i) =>
            n === 'ellipsis' ? (
              <span key={`e${i}`} className="px-2 text-gray-400">…</span>
            ) : (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${
                  n === currentPage ? 'bg-red text-white' : 'hover:bg-gray-light'
                }`}
              >
                {n}
              </button>
            )
          )}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-full text-sm font-semibold border-2 border-gray-200 disabled:opacity-40 hover:border-red hover:text-red transition-colors"
          >
            Successiva →
          </button>
        </div>
      )}
    </div>
  )
}
