import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface AppState {
  user: User | null
  token: string | null
  sidebarOpen: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  toggleSidebar: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      sidebarOpen: true,
      setUser: (user) => set({ user }),
      setToken: (token) => {
        localStorage.setItem('crm_token', token)
        set({ token })
      },
      logout: () => {
        localStorage.removeItem('crm_token')
        set({ user: null, token: null })
      },
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: 'crm-store', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
)
