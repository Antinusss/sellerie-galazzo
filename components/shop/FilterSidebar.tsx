'use client'

const CATEGORIES = ['Monta Inglese', 'Monta Western', 'Scuderia', 'Cavaliere']

interface FilterSidebarProps {
  selectedCategory: string
  onCategoryChange: (c: string) => void
  priceRange: [number, number]
  onPriceChange: (r: [number, number]) => void
}

export default function FilterSidebar({ selectedCategory, onCategoryChange, priceRange, onPriceChange }: FilterSidebarProps) {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
        <h3 className="font-black text-lg mb-6">Filtri</h3>

        {/* Category */}
        <div className="mb-8">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-400 mb-3">Categoria</h4>
          <div className="space-y-2">
            <button
              onClick={() => onCategoryChange('')}
              className={`block w-full text-left text-sm py-1 px-2 rounded-lg transition-colors ${
                selectedCategory === '' ? 'bg-red text-white font-semibold' : 'hover:bg-gray-light'
              }`}
            >
              Tutte le categorie
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`block w-full text-left text-sm py-1 px-2 rounded-lg transition-colors ${
                  selectedCategory === cat ? 'bg-red text-white font-semibold' : 'hover:bg-gray-light'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div className="mb-8">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-400 mb-3">
            Prezzo: €{(priceRange[0] / 100).toFixed(0)} – €{(priceRange[1] / 100).toFixed(0)}
          </h4>
          <input
            type="range"
            min={0}
            max={50000}
            step={500}
            value={priceRange[1]}
            onChange={e => onPriceChange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-red"
          />
        </div>
      </div>
    </aside>
  )
}
