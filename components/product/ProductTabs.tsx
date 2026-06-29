'use client'
import { useState } from 'react'

interface ProductTabsProps { description: string; specs: string }

const TABS = ['Descrizione', 'Specifiche', 'Spedizione & Resi'] as const

export default function ProductTabs({ description, specs }: ProductTabsProps) {
  const [active, setActive] = useState<typeof TABS[number]>('Descrizione')

  const content: Record<typeof TABS[number], React.ReactNode> = {
    'Descrizione': <p className="text-gray-600 leading-relaxed">{description}</p>,
    'Specifiche': (
      <div className="space-y-2">
        {specs.split(' | ').map(spec => {
          const [key, val] = spec.split(': ')
          return (
            <div key={spec} className="flex gap-4 py-2 border-b border-gray-100">
              <span className="font-semibold text-sm w-40 shrink-0">{key}</span>
              <span className="text-sm text-gray-600">{val}</span>
            </div>
          )
        })}
      </div>
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
