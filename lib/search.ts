import type { Product } from './types'

export function searchProducts(products: Product[], query: string, limit = 8): Product[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  return products
    .filter(p => {
      const haystacks = [p.name, p.brand, p.category, p.description].map(s => s.toLowerCase())
      return words.every(word => haystacks.some(h => h.includes(word)))
    })
    .slice(0, limit)
}
