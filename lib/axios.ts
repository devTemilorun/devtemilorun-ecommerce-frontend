import axios from 'axios'
import { useAuthStore } from '@/store/auth-store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 60000,
  withCredentials: false,
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (value: string) => void; reject: (reason?: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token!)
  })
  failedQueue = []
}

// ✅ Single function that clears everything and sends user to /login
const forceLogout = async (reason = 'Session expired') => {
  console.warn(`[Auth] ${reason} — clearing session and redirecting to login`)

  try {
    const { logout } = useAuthStore.getState()
    await logout()
  } catch (_) {}

  if (typeof document !== 'undefined') {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  }

  delete api.defaults.headers.common['Authorization']

  if (typeof window !== 'undefined') {
    const path = window.location.pathname
    const isAuthPage = path === '/login' || path === '/register' || path.startsWith('/verify') || path.startsWith('/check-email')
    if (!isAuthPage) {
      window.location.href = '/login'
    }
  }
}

// ── Request interceptor — attach latest token to every request ────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — handle all 401s automatically ─────────────────────
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config
    const status          = error.response?.status
    const url             = originalRequest?.url ?? ''

    // Not a 401 — let the caller handle it
    if (status !== 401) {
      return Promise.reject(error)
    }

    // Auth endpoints — never retry, just logout if it was a refresh attempt
    const isAuthEndpoint =
      url.includes('/auth/refresh') ||
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/verify-email') ||
      url.includes('/auth/check')

    if (isAuthEndpoint) {
      if (url.includes('/auth/refresh')) {
        await forceLogout('Refresh token rejected by server')
      }
      return Promise.reject(error)
    }

    // Already retried once and still 401 — token is genuinely invalid
    if (originalRequest._retry) {
      await forceLogout('Token refresh did not resolve 401')
      return Promise.reject(error)
    }

    // No token in store at all — nothing to refresh, go to login
    const currentToken = useAuthStore.getState().token
    if (!currentToken) {
      await forceLogout('No auth token found in store')
      return Promise.reject(error)
    }

    // Another refresh is already in flight — queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    // Attempt token refresh
    originalRequest._retry = true
    isRefreshing = true

    try {
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        { headers: { Authorization: `Bearer ${currentToken}` } }
      )

      const { token: newToken } = response.data
      if (!newToken) throw new Error('No token in refresh response')

      useAuthStore.getState().setToken(newToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

      processQueue(null, newToken)

      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return api(originalRequest)

    } catch (refreshError) {
      processQueue(refreshError, null)
      await forceLogout('Token refresh failed')
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

// ── Boot: rehydrate token into axios from localStorage on page load ───────────
// Without this, the first API call after a page refresh fires before Zustand
// finishes loading from localStorage, causing a spurious 401.
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const token = useAuthStore.getState().token
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, 0)
}

export default api