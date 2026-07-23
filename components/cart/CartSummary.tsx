'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '@/lib/utils'
import PaymentBadges from '@/components/shared/PaymentBadges'

export default function CartSummary() {
  const { totalPrice } = useCartStore()
  const [coupon, setCoupon] = useState('')
  const shipping = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 590
  const total = totalPrice + shipping

  return (
    <div className="bg-gray-light rounded-2xl p-6 sticky top-28">
      <h3 className="font-black text-lg mb-6">Riepilogo ordine</h3>

      <div className="space-y-3 text-sm mb-6">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotale</span>
          <span className="font-semibold">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Spedizione</span>
          <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
            {shipping === 0 ? 'Gratuita' : formatPrice(shipping)}
          </span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-gray-400">Aggiungi {formatPrice(FREE_SHIPPING_THRESHOLD - totalPrice)} per la spedizione gratuita</p>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <input
          value={coupon}
          onChange={e => setCoupon(e.target.value)}
          placeholder="Codice sconto"
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-sand"
        />
        <button className="border border-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-black hover:text-white transition-colors">
          Applica
        </button>
      </div>

      <div className="border-t border-gray-300 pt-4 mb-6">
        <div className="flex justify-between font-black text-lg">
          <span>Totale</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <ul className="space-y-2 text-xs text-gray-500 mb-4">
        <li>Consegna a domicilio disponibile</li>
        <li>Pagamento sicuro SSL</li>
        <li>Reso entro 14 giorni</li>
      </ul>

      <Link
        href="/checkout"
        className="block w-full bg-red text-white text-center py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
      >
        Procedi al checkout
      </Link>

      <div className="mt-4 pt-4 border-t border-gray-300">
        <p className="text-xs text-gray-400 mb-2">Pagamento sicuro e protetto</p>
        <PaymentBadges methods={['visa', 'mastercard', 'paypal', 'amex', 'maestro']} />
      </div>
    </div>
  )
}
