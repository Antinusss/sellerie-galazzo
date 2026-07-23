'use client'
import Image from 'next/image'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import PaymentBadges from '@/components/shared/PaymentBadges'

export default function OrderSummary() {
  const { items, totalPrice } = useCartStore()
  const shipping = totalPrice >= 8000 ? 0 : 590

  return (
    <div className="bg-gray-light rounded-2xl p-6">
      <h3 className="font-black text-lg mb-4">Il tuo ordine</h3>
      <div className="space-y-3 mb-4">
        {items.map(item => (
          <div key={item.product.id} className="flex gap-3 items-center">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0">
              <Image src={item.product.images[0] ?? ''} alt={item.product.name} fill className="object-cover" />
              <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <p className="text-xs font-semibold flex-1 line-clamp-2">{item.product.name}</p>
            <p className="text-xs font-black">{formatPrice(item.product.price * item.quantity)}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-300 pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotale</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Spedizione</span>
          <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
            {shipping === 0 ? 'Gratuita' : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between font-black text-base pt-2 border-t border-gray-300">
          <span>Totale</span>
          <span>{formatPrice(totalPrice + shipping)}</span>
        </div>
      </div>

      <ul className="space-y-2 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-300">
        <li>Spedizione gratuita sopra €80</li>
        <li>Pagamento sicuro SSL</li>
        <li>Reso entro 14 giorni</li>
        <li>Paga in 3 rate con Klarna</li>
      </ul>

      <div className="mt-4 pt-4 border-t border-gray-300">
        <PaymentBadges methods={['klarna', 'applepay', 'googlepay', 'visa', 'mastercard', 'amex']} />
      </div>
    </div>
  )
}
