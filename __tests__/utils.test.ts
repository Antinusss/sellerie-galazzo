import { formatPrice, slugify, getProductBySlug } from '@/lib/utils'
import type { Product } from '@/lib/types'

describe('formatPrice', () => {
  it('formats integer euros', () => expect(formatPrice(4500)).toBe('€45,00'))
  it('formats with decimals', () => expect(formatPrice(1750)).toBe('€17,50'))
  it('formats zero', () => expect(formatPrice(0)).toBe('€0,00'))
})

describe('slugify', () => {
  it('lowercases and hyphenates', () => expect(slugify('Equestro Cap')).toBe('equestro-cap'))
  it('removes special chars', () => expect(slugify('Occhiali Da Sole')).toBe('occhiali-da-sole'))
  it('handles accents', () => expect(slugify('Abbeveratoio a pressione')).toBe('abbeveratoio-a-pressione'))
})

describe('getProductBySlug', () => {
  const products: Product[] = [
    { id: '1', name: 'Test Product', slug: 'test-product', price: 1000, originalPrice: null,
      category: 'Monta Inglese', brand: 'Equestro', images: [], description: '', specs: '', inStock: true },
  ]
  it('finds product by slug', () => expect(getProductBySlug('test-product', products)?.id).toBe('1'))
  it('returns undefined for missing slug', () => expect(getProductBySlug('nope', products)).toBeUndefined())
})
