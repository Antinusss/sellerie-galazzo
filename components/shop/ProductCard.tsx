'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface ProductCardProps { product: Product }

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()
  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <Link href={`/shop/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-light">
        <Image
          src={product.images[0] ?? ''}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discountPct && (
          <span className="absolute top-3 left-3 bg-red text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPct}%
          </span>
        )}
        <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:text-red">
          <Heart size={16} />
        </button>
        {/* Quick add */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={e => { e.preventDefault(); addItem(product, 1) }}
            className="w-full bg-red text-white py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-dark transition-colors"
          >
            <ShoppingCart size={16} />
            Aggiungi al carrello
          </button>
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs text-sand font-semibold uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="font-semibold text-sm text-black leading-tight mb-2 line-clamp-2">{product.name}</h3>
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
