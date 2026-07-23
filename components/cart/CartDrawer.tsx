'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '@/lib/utils'
import PaymentBadges from '@/components/shared/PaymentBadges'

export default function CartDrawer() {
  const { items, totalItems, totalPrice, isCartOpen, closeCart, removeItem, updateQuantity } = useCartStore()

  return (
    <div
      className={`fixed inset-0 z-[70] transition-opacity duration-300 ${
        isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} />
      <aside
        className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-black text-lg">Carrello ({totalItems})</h2>
          <button onClick={closeCart} className="p-1 text-gray-400 hover:text-black transition-colors">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <ShoppingBag size={48} className="text-gray-200 mb-4" />
            <p className="font-bold mb-1">Il carrello è vuoto</p>
            <p className="text-sm text-gray-400 mb-6">Aggiungi qualcosa di bello per i tuoi cavalli.</p>
            <button onClick={closeCart} className="text-red font-semibold text-sm hover:text-red-dark">
              Continua lo shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-light shrink-0">
                    <Image src={item.product.images[0] ?? ''} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold line-clamp-2">{item.product.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatPrice(item.product.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden text-xs">
                        <button
                          onClick={() => item.quantity > 1 ? updateQuantity(item.product.id, item.quantity - 1) : removeItem(item.product.id)}
                          className="px-2 py-1 hover:bg-gray-light"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="px-2 font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-gray-light"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.product.id)} className="text-gray-300 hover:text-red transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-black shrink-0">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="px-6 py-5 border-t border-gray-100">
              {totalPrice < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-gray-400 mb-3">
                  Aggiungi {formatPrice(FREE_SHIPPING_THRESHOLD - totalPrice)} per la spedizione gratuita
                </p>
              )}
              <div className="flex justify-between font-black text-lg mb-4">
                <span>Subtotale</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full text-center border-2 border-black py-3 rounded-full font-bold text-sm hover:bg-black hover:text-white transition-colors"
                >
                  Vai al carrello
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full text-center bg-red text-white py-3 rounded-full font-bold text-sm hover:bg-red-dark transition-colors"
                >
                  Vai al checkout
                </Link>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                <PaymentBadges methods={['visa', 'mastercard', 'paypal', 'amex', 'maestro']} />
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
