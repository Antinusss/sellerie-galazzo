import { searchProducts } from '@/lib/search'
import type { Product } from '@/lib/types'

function product(id: string, name: string): Product {
  return {
    id, name, slug: `p${id}`, price: 100, originalPrice: null,
    category: 'Scuderia', categoryPath: ['Scuderia'], brand: 'X', images: [],
    description: '', specs: '', inStock: true,
  }
}

const products = [product('1', 'Cavezza corda'), product('2', 'Cavezza nylon'), product('3', 'Sella inglese')]

describe('searchProducts', () => {
  it('returns [] for an empty query', () => {
    expect(searchProducts(products, '')).toEqual([])
  })
  it('returns [] for a whitespace-only query', () => {
    expect(searchProducts(products, '   ')).toEqual([])
  })
  it('matches case-insensitively on product name', () => {
    expect(searchProducts(products, 'CAVEZZA').map(p => p.id)).toEqual(['1', '2'])
  })
  it('respects the limit', () => {
    expect(searchProducts(products, 'cavezza', 1).map(p => p.id)).toEqual(['1'])
  })
  it('returns [] when nothing matches', () => {
    expect(searchProducts(products, 'zzz')).toEqual([])
  })
})
