'use client'
import { useState } from 'react'

interface ProductTabsProps { description: string; specs: string }

const TABS = ['Descrizione', 'Specifiche', 'Spedizione & Resi'] as const

export default function ProductTabs({ description, specs }: ProductTabsProps) {
  const [active, setActive] = useState<typeof TABS[number]>('Descrizione')

  const content: Record<typeof TABS[number], React.ReactNode> = {
    'Descrizione': description ? (
      <p className="text-gray-600 leading-relaxed">{description}</p>
    ) : (
      <p className="text-gray-400">Descrizione non disponibile.</p>
    ),
    'Specifiche': specs ? (
      <ul className="space-y-2 list-disc list-inside text-sm text-gray-600">
        {specs.split(' | ').map(item => <li key={item}>{item}</li>)}
      </ul>
    ) : (
      <p className="text-sm text-gray-400">Nessuna specifica tecnica disponibile per questo prodotto.</p>
    ),
    'Spedizione & Resi': (
      <div className="space-y-4 text-sm text-gray-600">
        <p>🚚 <strong>Spedizione standard:</strong> 3-5 giorni lavorativi. Gratuita sopra €80, altrimenti €5,90.</p>
        <p>⚡ <strong>Spedizione express:</strong> 1-2 giorni lavorativi. €9,90.</p>
        <p>↩️ <strong>Resi:</strong> Gratuiti entro 30 giorni dall&apos;acquisto. Prodotto integro e imballato.</p>
      </div>
    ),
  }

  return (
    <div className="mt-12">
      <div className="flex gap-0 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              active === tab ? 'border-red text-red' : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="py-6">{content[active]}</div>
    </div>
  )
}
