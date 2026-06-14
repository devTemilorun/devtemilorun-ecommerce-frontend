
import axios from 'axios'
import { useAuthStore } from '@/store/auth-store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

console.log('API_URL configured as:', API_URL)

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true, // Important for cookies/sessions
  withXSRFToken: true,   // Important for CSRF
})

// CSRF token handling
let csrfPromise: Promise<void> | null = null

const fetchCsrfCookie = async () => {
  if (csrfPromise) return csrfPromise
  
  csrfPromise = (async () => {
    try {
      await axios.get(`${API_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
      })
    } catch (error) {
      console.error('Failed to fetch CSRF cookie:', error)
    } finally {
      csrfPromise = null
    }
  })()
  
  return csrfPromise
}

// Request interceptor to add token and ensure CSRF
api.interceptors.request.use(
  async (config) => {
    // Get token from store
    const token = useAuthStore.getState().token
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // For POST, PUT, DELETE requests, ensure CSRF cookie exists
    if (['post', 'put', 'patch', 'delete'].includes(config.method || '')) {
      await fetchCsrfCookie()
    }
    
    const fullUrl = config.baseURL ? config.baseURL + (config.url || '') : config.url || 'unknown'
    console.log('Making request to:', fullUrl, 'Token exists:', !!token)
    
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error.config?.url || 'unknown'
    console.error('API Error:', url, error.response?.status, error.response?.data)
    
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default api