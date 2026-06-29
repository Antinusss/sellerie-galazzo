'use client'
import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import type { CartItem as CartItemType } from '@/lib/types'

interface CartItemProps { item: CartItemType }

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCartStore()
  return (
    <div className="flex gap-4 py-5 border-b border-gray-100">
      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-light shrink-0">
        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-sand font-semibold uppercase">{item.product.category}</p>
        <p className="font-bold text-sm leading-tight mt-0.5">{item.product.name}</p>
        <p className="text-gray-400 text-xs mt-0.5">{item.product.brand}</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center border border-gray-200 rounded-full overflow-hidden text-sm">
            <button
              onClick={() => item.quantity > 1 ? updateQuantity(item.product.id, item.quantity - 1) : removeItem(item.product.id)}
              className="px-3 py-1 hover:bg-gray-light"
            >
              <Minus size={12} />
            </button>
            <span className="px-3 font-bold">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              className="px-3 py-1 hover:bg-gray-light"
            >
              <Plus size={12} />
            </button>
          </div>
          <button
            onClick={() => removeItem(item.product.id)}
            className="text-gray-300 hover:text-red transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-black">{formatPrice(item.product.price * item.quantity)}</p>
        {item.quantity > 1 && (
          <p className="text-xs text-gray-400">{formatPrice(item.product.price)} cad.</p>
        )}
      </div>
    </div>
  )
}
