import { act, renderHook } from '@testing-library/react'
import { useAuthStore } from '@/lib/auth-store'

beforeEach(() => {
  const { result } = renderHook(() => useAuthStore())
  act(() => result.current.logout())
})

describe('initial state', () => {
  it('starts with no user', () => {
    const { result } = renderHook(() => useAuthStore())
    expect(result.current.user).toBeNull()
  })
})

describe('login', () => {
  it('sets a user with a name derived from the email local-part', () => {
    const { result } = renderHook(() => useAuthStore())
    act(() => result.current.login('mario.rossi@example.com', 'anything'))
    expect(result.current.user).toEqual({ name: 'mario.rossi', email: 'mario.rossi@example.com' })
  })
})

describe('register', () => {
  it('sets a user with the combined name and given email', () => {
    const { result } = renderHook(() => useAuthStore())
    act(() => result.current.register('Mario', 'Rossi', 'mario@example.com', 'anything'))
    expect(result.current.user).toEqual({ name: 'Mario Rossi', email: 'mario@example.com' })
  })
})

describe('logout', () => {
  it('clears the user', () => {
    const { result } = renderHook(() => useAuthStore())
    act(() => result.current.login('a@b.com', 'x'))
    act(() => result.current.logout())
    expect(result.current.user).toBeNull()
  })
})
