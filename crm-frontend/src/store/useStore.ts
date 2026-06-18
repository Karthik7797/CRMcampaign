import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

export type Theme = 'light' | 'dark' | 'system'

interface AppState {
  user: User | null
  token: string | null
  sidebarOpen: boolean
  theme: Theme
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  toggleSidebar: () => void
  setTheme: (theme: Theme) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      sidebarOpen: true,
      theme: 'system',
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
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'crm-store', partialize: (s) => ({ user: s.user, token: s.token, theme: s.theme }) }
  )
)
