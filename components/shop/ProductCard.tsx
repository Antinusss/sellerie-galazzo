'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'
import { getBadge } from '@/lib/badges'
import { formatPrice } from '@/lib/utils'
import { getReviewSummary } from '@/lib/reviews'
import type { Product } from '@/lib/types'

interface ProductCardProps { product: Product }

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCartStore()
  const { toggleWishlist, isWishlisted } = useWishlistStore()
  const wishlisted = isWishlisted(product.id)
  const badge = getBadge(product.id)
  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null
  const { rating, count } = getReviewSummary(product.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <Link href={`/prodotto/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-light">
        <Image
          src={product.images[0] ?? ''}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {discountPct && (
            <span className="bg-red text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discountPct}%
            </span>
          )}
          {badge === 'bestseller' && (
            <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full">Bestseller</span>
          )}
          {badge === 'novita' && (
            <span className="bg-sand text-black text-xs font-bold px-2 py-1 rounded-full">Novità</span>
          )}
        </div>
        <button
          onClick={e => { e.preventDefault(); toggleWishlist(product.id) }}
          className={`absolute top-3 right-3 p-2 bg-white/90 rounded-full transition-opacity hover:text-red ${
            wishlisted ? 'opacity-100 text-red' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart size={16} className={wishlisted ? 'fill-red' : ''} />
        </button>
        {/* Quick add */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={e => { e.preventDefault(); addItem(product, 1); openCart() }}
            className="w-full bg-red text-white py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-dark transition-colors"
          >
            <ShoppingCart size={16} />
            Aggiungi al carrello
          </button>
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs text-sand font-semibold uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="font-semibold text-sm text-black leading-tight mb-1 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="fill-sand text-sand" />
          <span className="text-xs font-semibold text-gray-600">{rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({count})</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-black text-black">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-gray-400 text-sm line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
