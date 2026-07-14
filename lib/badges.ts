import { getReviewSummary } from './reviews'

export type Badge = 'novita' | 'bestseller' | null

const NOVITA_MODULO = 12
const BESTSELLER_COUNT_THRESHOLD = 110

function hashOf(id: string): number {
  const n = Number(id)
  return Number.isFinite(n) ? n : id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0)
}

export function getBadge(productId: string): Badge {
  const { count } = getReviewSummary(productId)
  if (count > BESTSELLER_COUNT_THRESHOLD) return 'bestseller'

  if (hashOf(productId) % NOVITA_MODULO === 0) return 'novita'

  return null
}
