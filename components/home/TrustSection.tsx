import { Truck, ShieldCheck, Headphones } from 'lucide-react'

const trusts = [
  { icon: Truck, title: 'Spedizione Gratuita', desc: "Su tutti gli ordini superiori a €80. Consegna in 3-5 giorni lavorativi." },
  { icon: ShieldCheck, title: 'Soddisfatti o Rimborsati', desc: "Garanzia di rimborso al 100% entro 30 giorni dall'acquisto." },
  { icon: Headphones, title: 'Supporto 24/7', desc: "Il nostro team è sempre disponibile per aiutarti nella scelta." },
]

export default function TrustSection() {
  return (
    <section className="py-20 bg-red-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {trusts.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-sand flex items-center justify-center">
                <Icon size={24} className="text-sand" />
              </div>
              <h3 className="text-xl font-black">{title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
