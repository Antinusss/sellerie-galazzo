import { GUIDE_LINKS } from '@/lib/guide-links'

describe('GUIDE_LINKS', () => {
  it('has 8 entries', () => {
    expect(GUIDE_LINKS).toHaveLength(8)
  })

  it('every entry has a non-empty label, href, and image', () => {
    for (const link of GUIDE_LINKS) {
      expect(link.label.length).toBeGreaterThan(0)
      expect(link.href.startsWith('/shop/')).toBe(true)
      expect(link.image.length).toBeGreaterThan(0)
    }
  })

  it('resolves a real product image for a known category', () => {
    const cureDelCavallo = GUIDE_LINKS.find(l => l.href === '/shop/scuderia/cura-del-cavallo')
    expect(cureDelCavallo).toBeDefined()
    expect(cureDelCavallo!.image).toMatch(/^https:\/\/selleriagalazzo\.com\//)
  })
})
