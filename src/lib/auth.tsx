import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api, setToken, clearToken } from './api'

export interface User {
  id: string
  email: string
  name: string | null
  role: 'user' | 'admin'
  onboardingStatus: 'not_started' | 'in_progress' | 'completed'
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function refreshUser() {
    try {
      const u = await api.get<User>('/auth/me')
      setUser(u)
    } catch {
      setUser(null)
      clearToken()
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      refreshUser().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function login(email: string, password: string) {
    const { token, user } = await api.post<{ token: string; user: User }>('/auth/login', { email, password })
    setToken(token)
    setUser(user)
  }

  async function register(email: string, password: string, name: string) {
    const { token, user } = await api.post<{ token: string; user: User }>('/auth/register', { email, password, name })
    setToken(token)
    setUser(user)
  }

  function logout() {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
