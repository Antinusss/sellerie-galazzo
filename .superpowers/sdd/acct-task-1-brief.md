### Task 1: Auth data layer

**Files:**
- Create: `lib/auth-store.ts`
- Test: `__tests__/auth-store.test.ts`

**Interfaces:**
- Produces: `useAuthStore(): { user: { name: string; email: string } | null; login(email: string, password: string): void; register(nome: string, cognome: string, email: string, password: string): void; logout(): void }` — a Zustand hook, imported by Task 2 (login/register pages), Task 3 (dashboard), and Task 4 (Navbar).

- [ ] **Step 1: Write the failing test**

Create `__tests__/auth-store.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/auth-store.test.ts`
Expected: FAIL with `Cannot find module '@/lib/auth-store'`

- [ ] **Step 3: Write minimal implementation**

Create `lib/auth-store.ts`:

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  name: string
  email: string
}

interface AuthState {
  user: AuthUser | null
  login: (email: string, password: string) => void
  register: (nome: string, cognome: string, email: string, password: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email, _password) => set({ user: { name: email.split('@')[0], email } }),
      register: (nome, cognome, email, _password) => set({ user: { name: `${nome} ${cognome}`, email } }),
      logout: () => set({ user: null }),
    }),
    { name: 'selleria-galazzo-auth' }
  )
)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/auth-store.test.ts`
Expected: PASS, 4/4 tests

- [ ] **Step 5: Commit**

```bash
git add lib/auth-store.ts __tests__/auth-store.test.ts
git commit -m "feat: add auth store"
```
