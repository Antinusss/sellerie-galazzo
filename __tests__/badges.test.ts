import { getBadge } from '@/lib/badges'

describe('getBadge', () => {
  it('is deterministic for the same product id', () => {
    expect(getBadge('67217')).toBe(getBadge('67217'))
  })

  it('returns "bestseller" for a product with a high review count', () => {
    // id=108 -> reviewCount = 3 + (108 % 118) = 111, above the 110 threshold
    expect(getBadge('108')).toBe('bestseller')
  })

  it('returns "novita" for a product whose id is a multiple of 12 and not a bestseller', () => {
    // id=12 -> reviewCount = 3 + (12 % 118) = 15 (below threshold), 12 % 12 === 0
    expect(getBadge('12')).toBe('novita')
  })

  it('returns null for a product matching neither rule', () => {
    // id=1 -> reviewCount = 4 (below threshold), 1 % 12 !== 0
    expect(getBadge('1')).toBeNull()
  })

  it('never returns both — every id yields exactly one of the three values', () => {
    for (let id = 0; id < 300; id++) {
      expect(['novita', 'bestseller', null]).toContain(getBadge(String(id)))
    }
  })
})
