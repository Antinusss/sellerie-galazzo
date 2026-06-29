'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import CheckoutSteps from '@/components/checkout/CheckoutSteps'
import OrderSummary from '@/components/checkout/OrderSummary'

type Step = 1 | 2 | 3

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState({ email: '', nome: '', cognome: '', indirizzo: '', cap: '', citta: '', shipping: 'standard' })
  const router = useRouter()
  const { clearCart } = useCartStore()

  const updateForm = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sand transition-colors"

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <CheckoutSteps currentStep={step} />
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Form area */}
        <div className="flex-1">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black">Contatti e indirizzo</h2>
              <input placeholder="Email *" value={form.email} onChange={e => updateForm('email', e.target.value)} className={inputClass} />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Nome *" value={form.nome} onChange={e => updateForm('nome', e.target.value)} className={inputClass} />
                <input placeholder="Cognome *" value={form.cognome} onChange={e => updateForm('cognome', e.target.value)} className={inputClass} />
              </div>
              <input placeholder="Indirizzo *" value={form.indirizzo} onChange={e => updateForm('indirizzo', e.target.value)} className={inputClass} />
              <div className="grid grid-cols-3 gap-4">
                <input placeholder="CAP *" value={form.cap} onChange={e => updateForm('cap', e.target.value)} className={inputClass} />
                <input placeholder="Città *" value={form.citta} onChange={e => updateForm('citta', e.target.value)} className={`${inputClass} col-span-2`} />
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-red text-white py-4 rounded-full font-bold hover:bg-red-dark transition-colors mt-4">
                Continua alla spedizione →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black">Metodo di spedizione</h2>
              {[
                { id: 'standard', label: 'Standard', desc: '3-5 giorni lavorativi', price: 'Gratuita sopra €80, altrimenti €5,90' },
                { id: 'express', label: 'Express', desc: '1-2 giorni lavorativi', price: '€9,90' },
              ].map(opt => (
                <label
                  key={opt.id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    form.shipping === opt.id ? 'border-red bg-red/5' : 'border-gray-200 hover:border-sand'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.id}
                      checked={form.shipping === opt.id}
                      onChange={() => updateForm('shipping', opt.id)}
                      className="accent-red"
                    />
                    <div>
                      <p className="font-bold text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.desc}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{opt.price}</p>
                </label>
              ))}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 border-2 border-black py-4 rounded-full font-bold hover:bg-black hover:text-white transition-colors">
                  ← Indietro
                </button>
                <button onClick={() => setStep(3)} className="flex-1 bg-red text-white py-4 rounded-full font-bold hover:bg-red-dark transition-colors">
                  Continua al pagamento →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black">Pagamento</h2>
              <div className="bg-gray-light rounded-xl p-4 text-xs text-gray-400 flex items-center gap-2">
                🔒 Connessione sicura — I tuoi dati sono protetti con crittografia SSL
              </div>
              <input placeholder="Numero carta *" className={inputClass} maxLength={19} />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Scadenza MM/AA *" className={inputClass} />
                <input placeholder="CVV *" className={inputClass} maxLength={4} />
              </div>
              <input placeholder="Nome sulla carta *" className={inputClass} />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="flex-1 border-2 border-black py-4 rounded-full font-bold hover:bg-black hover:text-white transition-colors">
                  ← Indietro
                </button>
                <button
                  onClick={() => { clearCart(); router.push('/checkout/success') }}
                  className="flex-1 bg-red text-white py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
                >
                  Conferma ordine
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:w-80">
          <OrderSummary />
        </div>
      </div>
    </div>
  )
}
