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
  email_verified_at?: string | null
  created_at?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<{ requires_verification: boolean; email: string }>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  updateUser: (data: Partial<User>) => void
  setToken: (token: string) => void
  setUser: (user: User) => void
  checkAuth: () => Promise<boolean>
}

// Type for axios error response
interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string
      requires_verification?: boolean
    }
    status?: number
  }
  message?: string
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
        if (typeof document !== 'undefined') {
          document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`
        }
      },

      setUser: (user: User) => {
        set({ user })
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
        } catch (error: unknown) {
          set({ isLoading: false })
          
          // Type guard for axios error
          const axiosError = error as AxiosErrorResponse
          
          // Handle unverified email
          if (axiosError.response?.status === 403 && axiosError.response?.data?.requires_verification) {
            throw new Error('Please verify your email before logging in')
          }
          
          throw new Error(axiosError.response?.data?.message || 'Login failed')
        }
      },

      register: async (name: string, email: string, password: string, passwordConfirmation: string) => {
        set({ isLoading: true })
        try {
          console.log('Register API call starting...')
          
          const response = await api.post('/auth/register', {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
          })
          
          console.log('Register response:', response.data)
          
          const { user, token, requires_verification } = response.data
          
          if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            set({ user, token })
            
            if (typeof document !== 'undefined') {
              document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`
              document.cookie = `user_role=${user.role}; path=/; max-age=${60 * 60 * 24 * 7}`
            }
          }
          
          set({ isLoading: false })
          
          return { 
            requires_verification: requires_verification || false, 
            email: user.email 
          }
          
        } catch (error: any) {
          console.error('Register API error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config,
          })
          
          set({ isLoading: false })
          
          // Throw with more specific error message
          if (error.message === 'Network Error') {
            throw new Error('Network Error: Unable to connect to the server. Please ensure the backend is running on port 8000.')
          }
          
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
          const token = get().token
          if (token) {
            await api.post('/auth/logout')
          }
        } catch (error: unknown) {
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
          const token = get().token
          if (!token) {
            console.log('No token found, skipping fetchUser')
            return null
          }
          
          const response = await api.get('/user')
          const userData = response.data.user || response.data
          set({ user: userData })
          return userData
        } catch (error: unknown) {
          console.error('Fetch user error:', error)
          const axiosError = error as AxiosErrorResponse
          
          // If unauthorized, clear auth state
          if (axiosError.response?.status === 401) {
            console.log('Unauthorized in fetchUser, clearing auth state')
            // Clear the token
            delete api.defaults.headers.common['Authorization']
            
            // Clear store
            set({ user: null, token: null })
            
            // Clear cookies
            if (typeof document !== 'undefined') {
              document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
              document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
            }
          }
          throw error
        }
      },

      checkAuth: async () => {
        try {
          const response = await api.get('/auth/check')
          if (response.data.authenticated) {
            set({ user: response.data.user })
            return true
          }
          return false
        } catch (error: unknown) {
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)