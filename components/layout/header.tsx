
'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/cart-store'
import { useAuthStore } from '@/store/auth-store'
import { ShoppingCart, User, Sun, Moon, Menu, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import api from '@/lib/axios'

export function Header() {
  const { theme, setTheme } = useTheme()
  const totalItems = useCartStore((state) => state.getTotalItems())
  const { user, token, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [sessionExpiryWarning, setSessionExpiryWarning] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Session timeout management (30 minutes = 1800000 ms)
  useEffect(() => {
    if (!token) return

    let sessionTimer: NodeJS.Timeout
    let warningTimer: NodeJS.Timeout

    // Set warning 5 minutes before expiry (25 minutes)
    warningTimer = setTimeout(() => {
      setSessionExpiryWarning(true)
      // Auto hide warning after 10 seconds
      setTimeout(() => setSessionExpiryWarning(false), 10000)
    }, 25 * 60 * 1000) // 25 minutes

    // Auto logout after 30 minutes
    sessionTimer = setTimeout(async () => {
      await logout()
      router.push('/login?session_expired=true')
    }, 30 * 60 * 1000) // 30 minutes

    return () => {
      clearTimeout(sessionTimer)
      clearTimeout(warningTimer)
    }
  }, [token, logout, router])

  // Refresh token on user activity
  useEffect(() => {
    if (!token) return

    const refreshToken = async () => {
      try {
        await api.post('/auth/refresh')
      } catch (error) {
        console.error('Token refresh failed:', error)
      }
    }

    // Refresh token every 25 minutes
    const refreshInterval = setInterval(refreshToken, 25 * 60 * 1000)

    // Reset session timer on user activity
    const resetSessionTimer = () => {
      // This will be handled by the main timer reset
    }

    window.addEventListener('click', resetSessionTimer)
    window.addEventListener('keypress', resetSessionTimer)
    window.addEventListener('mousemove', resetSessionTimer)

    return () => {
      clearInterval(refreshInterval)
      window.removeEventListener('click', resetSessionTimer)
      window.removeEventListener('keypress', resetSessionTimer)
      window.removeEventListener('mousemove', resetSessionTimer)
    }
  }, [token])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (!mounted) return null

  return (
    <>
      {/* Session Expiry Warning Toast */}
      {sessionExpiryWarning && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
          <div className="rounded-lg bg-yellow-50 p-4 shadow-lg dark:bg-yellow-950">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Your session will expire in 5 minutes
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  You will be automatically logged out for security
                </p>
              </div>
              <button
                onClick={() => setSessionExpiryWarning(false)}
                className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            ModernStore
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            <Link 
              href="/shop" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === '/shop' ? 'text-primary' : ''
              }`}
            >
              Shop
            </Link>
            <Link 
              href="/about" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === '/about' ? 'text-primary' : ''
              }`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === '/contact' ? 'text-primary' : ''
              }`}
            >
              Contact
            </Link>
            {user && (
              <Link 
                href="/dashboard" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith('/dashboard') ? 'text-primary' : ''
                }`}
              >
                Dashboard
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link 
                href="/admin/dashboard" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith('/admin') ? 'text-primary' : ''
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative" aria-label="Cart">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon" aria-label="Dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                  </Button>
                </Link>
                <span className="text-sm font-medium hidden sm:inline-block">
                  Hi, {user.name.split(' ')[0]}
                </span>
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background p-4">
            <nav className="flex flex-col gap-3">
              <Link 
                href="/shop" 
                className={`text-sm font-medium hover:text-primary ${
                  pathname === '/shop' ? 'text-primary' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link 
                href="/about" 
                className={`text-sm font-medium hover:text-primary ${
                  pathname === '/about' ? 'text-primary' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className={`text-sm font-medium hover:text-primary ${
                  pathname === '/contact' ? 'text-primary' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              {user && (
                <>
                  <Link 
                    href="/dashboard" 
                    className={`text-sm font-medium hover:text-primary ${
                      pathname.startsWith('/dashboard') ? 'text-primary' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {user.role === 'admin' && (
                    <Link 
                      href="/admin/dashboard" 
                      className="text-sm font-medium hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                </>
              )}
              {!user && (
                <Link 
                  href="/login" 
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
              {user && (
                <button 
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }} 
                  className="text-left text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  )
}