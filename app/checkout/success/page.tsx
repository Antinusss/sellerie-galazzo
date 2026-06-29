import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function SuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <CheckCircle size={72} className="mx-auto text-green-500 mb-6" />
      <h1 className="text-4xl font-black mb-3">Ordine confermato!</h1>
      <p className="text-gray-500 leading-relaxed mb-8">
        Grazie per il tuo acquisto. Riceverai una email di conferma con i dettagli della spedizione entro pochi minuti.
      </p>
      <div className="bg-gray-light rounded-2xl p-6 mb-8 text-left">
        <p className="text-sm font-semibold mb-1">Numero ordine</p>
        <p className="text-2xl font-black text-red">#SG-{Math.floor(Math.random() * 90000) + 10000}</p>
        <p className="text-xs text-gray-400 mt-2">Conserva questo numero per eventuali comunicazioni</p>
      </div>
      <Link
        href="/shop"
        className="inline-block bg-red text-white px-8 py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
      >
        Continua lo shopping
      </Link>
    </div>
  )
}
