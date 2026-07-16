import { searchProducts } from '@/lib/search'
import type { Product } from '@/lib/types'

function product(id: string, overrides: Partial<Product> = {}): Product {
  return {
    id, name: 'Prodotto generico', slug: `p${id}`, price: 100, originalPrice: null,
    category: 'Scuderia', categoryPath: ['Scuderia'], brand: 'X', images: [],
    description: '', specs: '', inStock: true,
    ...overrides,
  }
}

describe('searchProducts', () => {
  it('returns [] for an empty query', () => {
    expect(searchProducts([product('1')], '')).toEqual([])
  })

  it('returns [] for a whitespace-only query', () => {
    expect(searchProducts([product('1')], '   ')).toEqual([])
  })

  it('matches case-insensitively on product name', () => {
    const products = [
      product('1', { name: 'Cavezza corda' }),
      product('2', { name: 'Cavezza nylon' }),
      product('3', { name: 'Sella inglese' }),
    ]
    expect(searchProducts(products, 'CAVEZZA').map(p => p.id)).toEqual(['1', '2'])
  })

  it('matches on the brand field', () => {
    const products = [
      product('1', { name: 'Sapone per il cuoio', brand: 'Acavallo' }),
      product('2', { name: 'Sapone neutro', brand: 'Equestro' }),
    ]
    expect(searchProducts(products, 'acavallo').map(p => p.id)).toEqual(['1'])
  })

  it('matches on the category field', () => {
    const products = [
      product('1', { category: 'Monta Western' }),
      product('2', { category: 'Scuderia' }),
    ]
    expect(searchProducts(products, 'western').map(p => p.id)).toEqual(['1'])
  })

  it('matches on the description field', () => {
    const products = [
      product('1', { description: 'Ideale per il freddo invernale' }),
      product('2', { description: 'Prodotto estivo traspirante' }),
    ]
    expect(searchProducts(products, 'invernale').map(p => p.id)).toEqual(['1'])
  })

  it('requires every query word to match, in any field', () => {
    const products = [
      product('1', { name: 'Guanti da equitazione', brand: 'Acavallo' }),
      product('2', { name: 'Guanti da giardinaggio', brand: 'Equestro' }),
    ]
    expect(searchProducts(products, 'guanti acavallo').map(p => p.id)).toEqual(['1'])
  })

  it('returns [] when nothing matches', () => {
    expect(searchProducts([product('1', { name: 'Sella' })], 'zzz')).toEqual([])
  })

  it('defaults to a limit of 8 results', () => {
    const products = Array.from({ length: 10 }, (_, i) => product(String(i), { name: 'Cavezza' }))
    expect(searchProducts(products, 'cavezza')).toHaveLength(8)
  })

  it('respects an explicit limit', () => {
    const products = [product('1', { name: 'Cavezza corda' }), product('2', { name: 'Cavezza nylon' })]
    expect(searchProducts(products, 'cavezza', 1).map(p => p.id)).toEqual(['1'])
  })

  it('returns all matches uncapped when limit is Infinity', () => {
    const products = Array.from({ length: 10 }, (_, i) => product(String(i), { name: 'Cavezza' }))
    expect(searchProducts(products, 'cavezza', Infinity)).toHaveLength(10)
  })
})
