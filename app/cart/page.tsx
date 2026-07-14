'use client'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import CartItem from '@/components/cart/CartItem'
import CartSummary from '@/components/cart/CartSummary'

export default function CartPage() {
  const { items } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
        <h1 className="text-3xl font-black mb-3">Il tuo carrello è vuoto</h1>
        <p className="text-gray-400 mb-8">Aggiungi qualcosa di bello per i tuoi cavalli e per te.</p>
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
      <h1 className="text-4xl font-black mb-6">
        Il tuo <em className="text-red">carrello</em>
      </h1>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{items.length} {items.length === 1 ? 'articolo' : 'articoli'}</p>
        <Link href="/shop" className="text-sm font-semibold text-red hover:text-red-dark transition-colors">
          ← Continua lo shopping
        </Link>
      </div>
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1">
          {items.map(item => <CartItem key={item.product.id} item={item} />)}
        </div>
        <div className="lg:w-80">
          <CartSummary />
        </div>
      </div>
    </div>
  )
}
