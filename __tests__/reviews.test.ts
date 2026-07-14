import { getReviewSummary } from '@/lib/reviews'

describe('getReviewSummary', () => {
  it('is deterministic for the same product id', () => {
    expect(getReviewSummary('67217')).toEqual(getReviewSummary('67217'))
  })

  it('returns a rating from the positive-skewed pool', () => {
    const { rating } = getReviewSummary('15')
    expect([4.2, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0]).toContain(rating)
  })

  it('returns a count between 3 and 120', () => {
    const { count } = getReviewSummary('42')
    expect(count).toBeGreaterThanOrEqual(3)
    expect(count).toBeLessThanOrEqual(120)
  })

  it('caps sample reviews at 5 even when count is higher', () => {
    const { count, reviews } = getReviewSummary('117')
    expect(count).toBeGreaterThan(5)
    expect(reviews.length).toBe(5)
  })

  it('returns fewer sample reviews than 5 when count is under 5', () => {
    const { count, reviews } = getReviewSummary('118')
    expect(count).toBe(3)
    expect(reviews.length).toBe(3)
  })

  it('every sample review has a non-empty author/date/text and a plausible rating', () => {
    const { reviews } = getReviewSummary('999')
    for (const r of reviews) {
      expect(r.author.length).toBeGreaterThan(0)
      expect(r.date.length).toBeGreaterThan(0)
      expect(r.text.length).toBeGreaterThan(0)
      expect(r.rating).toBeGreaterThanOrEqual(3.5)
      expect(r.rating).toBeLessThanOrEqual(5.0)
    }
  })

  it('produces different output for different product ids', () => {
    const a = getReviewSummary('10')
    const b = getReviewSummary('11')
    expect(a).not.toEqual(b)
  })

  it('does not throw for a non-numeric id and stays deterministic', () => {
    expect(() => getReviewSummary('abc')).not.toThrow()
    expect(getReviewSummary('abc')).toEqual(getReviewSummary('abc'))
  })
})
