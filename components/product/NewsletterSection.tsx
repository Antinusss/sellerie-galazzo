'use client'
import { useState } from 'react'
import { Mail } from 'lucide-react'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
  }

  return (
    <section className="mt-16 -mx-4 sm:-mx-6 lg:-mx-8 bg-black text-white rounded-3xl px-8 py-14 text-center">
      <Mail size={28} className="mx-auto mb-4 text-sand" />
      <h2 className="text-2xl lg:text-3xl font-black mb-2">
        Ricevi il <em className="text-red">10% di sconto</em>
      </h2>
      <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
        Iscriviti alla newsletter e ricevi subito un codice sconto del 10% sul tuo primo ordine, più novità e offerte esclusive per cavalieri.
      </p>
      {subscribed ? (
        <p className="text-sand font-semibold">Grazie! Controlla la tua casella email per il codice sconto.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="La tua email"
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sand"
          />
          <button
            type="submit"
            className="bg-red text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-red-dark transition-colors"
          >
            Iscriviti
          </button>
        </form>
      )}
    </section>
  )
}
