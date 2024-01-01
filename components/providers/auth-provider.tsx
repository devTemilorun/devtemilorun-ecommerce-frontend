'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { usePathname, useRouter } from 'next/navigation'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const { user, token, fetchUser } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token && !user) {
          await fetchUser()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [token, user, fetchUser])

  useEffect(() => {
    if (!isLoading) {
      const publicRoutes = [
        '/', 
        '/login', 
        '/register', 
        '/verify-email', 
        '/products', 
        '/product',
        '/about',
        '/contact',
        '/shop',
        '/cart',
        '/order-success',
        '/order-failed',
      ]
      
      const isPublicRoute = publicRoutes.some(route => 
        pathname === route || pathname?.startsWith(route + '/')
      )
      
      const isAdminRoute = pathname?.startsWith('/admin')
      
      if (!token && !isPublicRoute) {
        console.log('Redirecting to login - protected route:', pathname)
        router.push('/login')
      }
      
      if (token && (pathname === '/login' || pathname === '/register')) {
        router.push('/')
      }
      
      if (isAdminRoute && token && user && user.role !== 'admin') {
        console.log('Redirecting - not admin:', pathname)
        router.push('/')
      }
    }
  }, [pathname, token, user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}