import { act, renderHook } from '@testing-library/react'
import { useCartStore } from '@/lib/store'
import type { Product } from '@/lib/types'

const mockProduct: Product = {
  id: '1', name: 'Test', slug: 'test', price: 5000, originalPrice: null,
  category: 'Monta Inglese', categoryPath: ['Monta Inglese'], brand: 'Test', images: [],
  description: '', specs: '', inStock: true,
}

beforeEach(() => {
  const { result } = renderHook(() => useCartStore())
  act(() => result.current.clearCart())
  act(() => result.current.closeCart())
})

describe('addItem', () => {
  it('adds new item', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem(mockProduct, 1))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(1)
  })
  it('increments existing item quantity', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem(mockProduct, 1))
    act(() => result.current.addItem(mockProduct, 2))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(3)
  })
})

describe('removeItem', () => {
  it('removes item by product id', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem(mockProduct, 1))
    act(() => result.current.removeItem('1'))
    expect(result.current.items).toHaveLength(0)
  })
})

describe('updateQuantity', () => {
  it('updates quantity', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem(mockProduct, 1))
    act(() => result.current.updateQuantity('1', 5))
    expect(result.current.items[0].quantity).toBe(5)
  })
})

describe('computed values', () => {
  it('totalItems counts all quantities', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem(mockProduct, 3))
    expect(result.current.totalItems).toBe(3)
  })
  it('totalPrice sums prices in cents', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem(mockProduct, 2))
    expect(result.current.totalPrice).toBe(10000)
  })
})

describe('cart drawer state', () => {
  it('starts closed', () => {
    const { result } = renderHook(() => useCartStore())
    expect(result.current.isCartOpen).toBe(false)
  })
  it('openCart sets isCartOpen to true', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.openCart())
    expect(result.current.isCartOpen).toBe(true)
  })
  it('closeCart sets isCartOpen to false', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.openCart())
    act(() => result.current.closeCart())
    expect(result.current.isCartOpen).toBe(false)
  })
})
