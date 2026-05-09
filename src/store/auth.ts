import { create } from 'zustand'

interface AuthState {
  apiKey: string
  apiBase: string
  isAuthenticated: boolean
  setApiKey: (key: string, base?: string) => void
  logout: () => void
}

export const useAuth = create<AuthState>((set) => ({
  apiKey: localStorage.getItem('chutney_api_key') || '',
  apiBase: localStorage.getItem('chutney_api_base') || 'https://web-production-82d65.up.railway.app',
  isAuthenticated: !!localStorage.getItem('chutney_api_key'),

  setApiKey: (key, base) => {
    localStorage.setItem('chutney_api_key', key)
    if (base) localStorage.setItem('chutney_api_base', base)
    set({ apiKey: key, apiBase: base || localStorage.getItem('chutney_api_base') || '', isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('chutney_api_key')
    localStorage.removeItem('chutney_api_base')
    set({ apiKey: '', isAuthenticated: false })
  },
}))
