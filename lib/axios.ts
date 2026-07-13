import axios from 'axios'
import { useAuthStore } from '@/store/auth-store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

console.log('API URL:', API_URL)

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
  withCredentials: false,
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (value: string) => void; reject: (reason?: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url)
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/check')
    ) {
      console.log('401 Unauthorized, attempting to refresh token...')

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { token } = useAuthStore.getState()
        
        if (!token) {
          console.log('No token available, redirecting to login...')
          throw new Error('No token available')
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        const { token: newToken } = response.data
        
        if (!newToken) {
          throw new Error('No new token received')
        }

        const { setToken } = useAuthStore.getState()
        setToken(newToken)
        
        processQueue(null, newToken)
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
        
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError)
        
        processQueue(refreshError, null)
        
        const { logout } = useAuthStore.getState()
        await logout()
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (error.response?.status === 401 && originalRequest.url?.includes('/auth/refresh')) {
      console.error('Refresh endpoint returned 401, logging out...')
      const { logout } = useAuthStore.getState()
      await logout()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api