import { applyOfferPricing } from '@/lib/offers'
import type { Product } from '@/lib/types'

function product(id: string, price: number): Product {
  return {
    id, name: `P${id}`, slug: `p${id}`, price, originalPrice: null,
    category: 'Scuderia', categoryPath: ['Scuderia'], brand: 'X', images: [],
    description: '', specs: '', inStock: true,
  }
}

describe('applyOfferPricing', () => {
  it('leaves a product whose id is not a multiple of 15 untouched', () => {
    const [result] = applyOfferPricing([product('14', 1000)])
    expect(result.originalPrice).toBeNull()
    expect(result.price).toBe(1000)
  })

  it('applies a 15% discount original price for id=15', () => {
    const [result] = applyOfferPricing([product('15', 1000)])
    expect(result.originalPrice).toBe(1176)
  })

  it('applies a 20% discount original price for id=30', () => {
    const [result] = applyOfferPricing([product('30', 1000)])
    expect(result.originalPrice).toBe(1250)
  })

  it('applies a 25% discount original price for id=45', () => {
    const [result] = applyOfferPricing([product('45', 1000)])
    expect(result.originalPrice).toBe(1333)
  })

  it('applies a 30% discount original price for id=60', () => {
    const [result] = applyOfferPricing([product('60', 1000)])
    expect(result.originalPrice).toBe(1429)
  })

  it('cycles back to a 10% discount for id=75', () => {
    const [result] = applyOfferPricing([product('75', 1000)])
    expect(result.originalPrice).toBe(1111)
  })

  it('does not mutate the input array', () => {
    const input = [product('15', 1000)]
    applyOfferPricing(input)
    expect(input[0].originalPrice).toBeNull()
  })
})
