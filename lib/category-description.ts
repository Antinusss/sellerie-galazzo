import type { Category } from './types'

export function categoryDescription(category: Category): string {
  if (category.depth === 1) {
    return `Tutto il necessario per ${category.name}: ${category.productCount} prodotti selezionati, spedizione rapida in tutta Italia e reso entro 14 giorni.`
  }
  const parent = category.path[category.path.length - 2]
  return `Scopri i nostri ${category.productCount} prodotti di ${category.name} per ${parent}: qualità professionale, spedizione tracciata e reso entro 14 giorni.`
}
