import { categoryDescription } from '@/lib/category-description'
import type { Category } from '@/lib/types'

function category(overrides: Partial<Category>): Category {
  return {
    path: ['Monta Inglese'], slug: ['monta-inglese'], name: 'Monta Inglese',
    depth: 1, productCount: 10, ...overrides,
  }
}

describe('categoryDescription', () => {
  it('uses the branch template for depth-1 categories', () => {
    const cat = category({ path: ['Scuderia'], slug: ['scuderia'], name: 'Scuderia', depth: 1, productCount: 345 })
    expect(categoryDescription(cat)).toBe(
      'Tutto il necessario per Scuderia: 345 prodotti selezionati, spedizione rapida in tutta Italia e reso entro 14 giorni.'
    )
  })

  it('uses the parent-referencing template for depth-3 categories, referencing the immediate parent', () => {
    const cat = category({
      path: ['Monta Inglese', 'Cavaliere', 'Selle e accessori'],
      slug: ['monta-inglese', 'cavaliere', 'selle-e-accessori'],
      name: 'Selle e accessori', depth: 3, productCount: 42,
    })
    expect(categoryDescription(cat)).toBe(
      'Scopri i nostri 42 prodotti di Selle e accessori per Cavaliere: qualità professionale, spedizione tracciata e reso entro 14 giorni.'
    )
  })

  it('references the top-level branch as parent for depth-2 categories', () => {
    const cat = category({
      path: ['Monta Inglese', 'Cavaliere'],
      slug: ['monta-inglese', 'cavaliere'],
      name: 'Cavaliere', depth: 2, productCount: 120,
    })
    expect(categoryDescription(cat)).toBe(
      'Scopri i nostri 120 prodotti di Cavaliere per Monta Inglese: qualità professionale, spedizione tracciata e reso entro 14 giorni.'
    )
  })
})
