import { act, renderHook } from '@testing-library/react'
import { useWishlistStore } from '@/lib/wishlist-store'

beforeEach(() => {
  const { result } = renderHook(() => useWishlistStore())
  act(() => {
    for (const id of [...result.current.productIds]) result.current.toggleWishlist(id)
  })
})

describe('toggleWishlist', () => {
  it('adds a product id when not present', () => {
    const { result } = renderHook(() => useWishlistStore())
    act(() => result.current.toggleWishlist('42'))
    expect(result.current.productIds).toEqual(['42'])
  })

  it('removes a product id when already present', () => {
    const { result } = renderHook(() => useWishlistStore())
    act(() => result.current.toggleWishlist('42'))
    act(() => result.current.toggleWishlist('42'))
    expect(result.current.productIds).toEqual([])
  })

  it('supports multiple distinct ids', () => {
    const { result } = renderHook(() => useWishlistStore())
    act(() => result.current.toggleWishlist('1'))
    act(() => result.current.toggleWishlist('2'))
    expect(result.current.productIds).toEqual(['1', '2'])
  })
})

describe('isWishlisted', () => {
  it('returns false for an id never added', () => {
    const { result } = renderHook(() => useWishlistStore())
    expect(result.current.isWishlisted('999')).toBe(false)
  })

  it('returns true after toggling on', () => {
    const { result } = renderHook(() => useWishlistStore())
    act(() => result.current.toggleWishlist('7'))
    expect(result.current.isWishlisted('7')).toBe(true)
  })
})
