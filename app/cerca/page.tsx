'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import allProducts from '@/data/products.json'
import type { Product } from '@/lib/types'
import { searchProducts } from '@/lib/search'
import PaginatedProductGrid from '@/components/shop/PaginatedProductGrid'

const products = allProducts as Product[]

function CercaResults() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const results = searchProducts(products, q, Infinity)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-black mb-2">
        Risultati per <em className="text-red">&quot;{q}&quot;</em>
      </h1>
      <p className="text-sm text-gray-400 mb-8">{results.length} prodotti trovati</p>
      {results.length === 0 ? (
        <p className="text-gray-400">Nessun prodotto corrisponde alla tua ricerca.</p>
      ) : (
        <PaginatedProductGrid products={results} />
      )}
    </div>
  )
}

export default function CercaPage() {
  return (
    <Suspense fallback={null}>
      <CercaResults />
    </Suspense>
  )
}
