'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Heart, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { findCategoryByPath } from '@/lib/category-tree'
import categoriesData from '@/data/categories.json'
import type { Product, Category } from '@/lib/types'

const categories = categoriesData as Category[]

interface ProductInfoProps { product: Product }

export default function ProductInfo({ product }: ProductInfoProps) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCartStore()
  const breadcrumbSlug = findCategoryByPath(categories, product.categoryPath)?.slug ?? []

  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  const handleAdd = () => {
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <nav className="text-sand font-bold uppercase text-xs tracking-widest mb-2 flex flex-wrap items-center gap-1">
          {product.categoryPath.map((segment, i) => (
            <span key={segment} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-300">/</span>}
              {breadcrumbSlug.length > 0 ? (
                <Link href={`/shop/${breadcrumbSlug.slice(0, i + 1).join('/')}`} className="hover:text-red transition-colors">
                  {segment}
                </Link>
              ) : (
                <span>{segment}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="text-3xl lg:text-4xl font-black text-black leading-tight">{product.name}</h1>
        {product.brand && <p className="text-gray-400 text-sm mt-1">{product.brand}</p>}
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black">{formatPrice(product.price)}</span>
        {product.originalPrice && (
          <>
            <span className="text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
            <span className="bg-red text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discountPct}%</span>
          </>
        )}
      </div>

      {/* Qty */}
      <div>
        <p className="text-sm font-semibold mb-3">Quantità</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center border-2 border-gray-200 rounded-full overflow-hidden">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-4 py-2 hover:bg-gray-light transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="px-4 font-bold">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="px-4 py-2 hover:bg-gray-light transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleAdd}
          className={`w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-colors ${
            added ? 'bg-green-600 text-white' : 'bg-red text-white hover:bg-red-dark'
          }`}
        >
          <ShoppingCart size={20} />
          {added ? 'Aggiunto al carrello ✓' : 'Aggiungi al carrello'}
        </button>
        <button className="w-full py-4 rounded-full font-bold border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2">
          <Heart size={20} />
          Aggiungi alla wishlist
        </button>
      </div>

      {/* Trust mini */}
      <div className="border-t border-gray-100 pt-4 grid grid-cols-3 gap-2 text-center text-xs text-gray-400">
        <div>🚚 Spedizione gratuita<br/>sopra €80</div>
        <div>↩️ Reso gratuito<br/>30 giorni</div>
        <div>🔒 Pagamento<br/>sicuro</div>
      </div>
    </div>
  )
}
