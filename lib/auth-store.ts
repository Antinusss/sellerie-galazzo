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
