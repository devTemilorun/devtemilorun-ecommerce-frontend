
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/axios'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'customer'
  avatar?: string
  phone?: string
  created_at?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  updateUser: (data: Partial<User>) => void
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setToken: (token: string) => {
        set({ token })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', { email, password })
          const { user, token } = response.data
          
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          set({ user, token, isLoading: false })
          
          if (typeof document !== 'undefined') {
            document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`
            document.cookie = `user_role=${user.role}; path=/; max-age=${60 * 60 * 24 * 7}`
          }
        } catch (error: any) {
          set({ isLoading: false })
          throw new Error(error.response?.data?.message || 'Login failed')
        }
      },

      register: async (name: string, email: string, password: string, passwordConfirmation: string) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/register', {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
          })
          const { user, token } = response.data
          
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          set({ user, token, isLoading: false })
          
          if (typeof document !== 'undefined') {
            document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`
            document.cookie = `user_role=${user.role}; path=/; max-age=${60 * 60 * 24 * 7}`
          }
        } catch (error: any) {
          set({ isLoading: false })
          throw new Error(error.response?.data?.message || 'Registration failed')
        }
      },

      updateUser: (data: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...data } })
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await api.post('/auth/logout')
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          delete api.defaults.headers.common['Authorization']
          
          set({ user: null, token: null, isLoading: false })
          
          if (typeof document !== 'undefined') {
            document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
            document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
          }
        }
      },

      fetchUser: async () => {
        try {
          const response = await api.get('/user')
          set({ user: response.data.user || response.data })
        } catch (error) {
          console.error('Fetch user error:', error)
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)