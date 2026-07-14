import type { Product } from './types'

export function searchProducts(products: Product[], query: string, limit = 8): Product[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return products.filter(p => p.name.toLowerCase().includes(q)).slice(0, limit)
}
