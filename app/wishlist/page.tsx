'use client'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import allProducts from '@/data/products.json'
import type { Product } from '@/lib/types'
import { useWishlistStore } from '@/lib/wishlist-store'
import PaginatedProductGrid from '@/components/shop/PaginatedProductGrid'

const products = allProducts as Product[]

export default function WishlistPage() {
  const { productIds } = useWishlistStore()
  const wishlisted = products.filter(p => productIds.includes(p.id))

  if (wishlisted.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Heart size={64} className="mx-auto text-gray-200 mb-6" />
        <h1 className="text-3xl font-black mb-3">La tua wishlist è vuota</h1>
        <p className="text-gray-400 mb-8">Salva i prodotti che ti piacciono per ritrovarli facilmente.</p>
        <Link
          href="/shop"
          className="inline-block bg-red text-white px-8 py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
        >
          Vai allo shop
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-black mb-2">
        La tua <em className="text-red">wishlist</em>
      </h1>
      <p className="text-sm text-gray-400 mb-8">{wishlisted.length} prodotti salvati</p>
      <PaginatedProductGrid products={wishlisted} />
    </div>
  )
}
