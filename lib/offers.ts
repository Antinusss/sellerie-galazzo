import type { Product } from './types'

const OFFER_MODULO = 15
const DISCOUNT_BASE = 10
const DISCOUNT_STEP = 5
const DISCOUNT_BUCKETS = 5

export function applyOfferPricing(products: Product[]): Product[] {
  return products.map(p => {
    const numericId = Number(p.id)
    if (!Number.isFinite(numericId) || numericId % OFFER_MODULO !== 0 || p.price <= 0) return p

    const bucket = Math.floor(numericId / OFFER_MODULO) % DISCOUNT_BUCKETS
    const discountPct = DISCOUNT_BASE + bucket * DISCOUNT_STEP
    const originalPrice = Math.round(p.price / (1 - discountPct / 100))

    return { ...p, originalPrice }
  })
}
