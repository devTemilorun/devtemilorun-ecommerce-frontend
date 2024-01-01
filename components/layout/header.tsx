'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/cart-store'
import { useAuthStore } from '@/store/auth-store'
import {
  ShoppingCart, Sun, Moon, Menu, LogOut,
  LayoutDashboard, Store, Info, Mail, X, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import api from '@/lib/axios'

// ── Active-link helper ────────────────────────────────────────────────────────
function useIsActive() {
  const pathname = usePathname()

  return (href: string, exact = false): boolean => {
    if (exact) return pathname === href
    // Root exact-match
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }
}

// ── Nav link (desktop) ────────────────────────────────────────────────────────
function NavLink({
  href,
  children,
  exact = false,
  onClick,
}: {
  href: string
  children: React.ReactNode
  exact?: boolean
  onClick?: () => void
}) {
  const isActive = useIsActive()
  const active = isActive(href, exact)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        relative pb-0.5 text-sm font-medium transition-colors
        after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-foreground
        after:transition-all after:duration-300 after:ease-in-out
        ${active
          ? 'text-foreground after:w-full'
          : 'text-muted-foreground hover:text-foreground after:w-0 hover:after:w-full'
        }
      `}
    >
      {children}
    </Link>
  )
}

// ── Drawer nav link (mobile) ──────────────────────────────────────────────────
function DrawerLink({
  href,
  icon: Icon,
  children,
  exact = false,
  onClick,
  className = '',
}: {
  href: string
  icon: React.ElementType
  children: React.ReactNode
  exact?: boolean
  onClick?: () => void
  className?: string
}) {
  const isActive = useIsActive()
  const active = isActive(href, exact)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
        transition-colors
        ${active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        }
        ${className}
      `}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {children}
    </Link>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function Header() {
  const { theme, setTheme } = useTheme()
  const totalItems = useCartStore((state) => state.getTotalItems())
  const { user, token, logout } = useAuthStore()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [sessionExpiryWarning, setSessionExpiryWarning] = useState(false)
  const sessionTimerRef = useRef<number | null>(null)
  const warningTimerRef = useRef<number | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // Close drawer on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileMenuOpen])

  // Close drawer on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Session timer
  useEffect(() => {
    if (!token) return

    const clearTimers = () => {
      if (sessionTimerRef.current) window.clearTimeout(sessionTimerRef.current)
      if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current)
    }

    const startTimers = () => {
      clearTimers()
      warningTimerRef.current = window.setTimeout(() => {
        setSessionExpiryWarning(true)
        window.setTimeout(() => setSessionExpiryWarning(false), 10_000)
      }, 25 * 60 * 1000)

      sessionTimerRef.current = window.setTimeout(async () => {
        await logout()
        router.push('/login?session_expired=true')
      }, 30 * 60 * 1000)
    }

    const resetSessionTimer = () => {
      setSessionExpiryWarning(false)
      startTimers()
    }

    startTimers()
    window.addEventListener('click', resetSessionTimer)
    window.addEventListener('keypress', resetSessionTimer)
    window.addEventListener('mousemove', resetSessionTimer)

    return () => {
      clearTimers()
      window.removeEventListener('click', resetSessionTimer)
      window.removeEventListener('keypress', resetSessionTimer)
      window.removeEventListener('mousemove', resetSessionTimer)
    }
  }, [token, logout, router])

  // Token refresh
  useEffect(() => {
    if (!token) return
    const id = setInterval(async () => {
      try { await api.post('/auth/refresh') } catch (e) { console.error(e) }
    }, 25 * 60 * 1000)
    return () => clearInterval(id)
  }, [token])

  const handleLogout = async () => {
    setMobileMenuOpen(false)
    await logout()
    router.push('/')
  }

  const closeMenu = () => setMobileMenuOpen(false)

  if (!mounted) return null

  const userInitials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      {/* Session expiry warning */}
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
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <header
        ref={drawerRef}
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight">
            ModernStore
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/shop">Shop</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/contact">Contact</NavLink>
            {user && <NavLink href="/dashboard">Dashboard</NavLink>}
            {user?.role === 'admin' && <NavLink href="/admin/dashboard">Admin</NavLink>}
          </nav>

          {/* Right-side actions */}
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Cart */}
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

            {/* User area (desktop) */}
            {user ? (
              <div className="hidden sm:flex items-center gap-1">
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon" aria-label="Dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                  </Button>
                </Link>
                <span className="text-sm font-medium px-1">
                  Hi, {user.name.split(' ')[0]}
                </span>
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  Sign in
                </Button>
              </Link>
            )}

            {/* Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen
                ? <X className="h-5 w-5" />
                : <Menu className="h-5 w-5" />
              }
            </Button>
          </div>
        </div>

        {/* ── Mobile drawer ─────────────────────────────────────────────── */}
        <div
          className={`
            md:hidden overflow-hidden border-t bg-background
            transition-all duration-300 ease-in-out
            ${mobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="px-4 py-4 space-y-5">

            {/* User info strip */}
            {user && (
              <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div>
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Navigation
              </p>
              <div className="space-y-0.5">
                <DrawerLink href="/shop" icon={Store} onClick={closeMenu}>Shop</DrawerLink>
                <DrawerLink href="/about" icon={Info} onClick={closeMenu}>About</DrawerLink>
                <DrawerLink href="/contact" icon={Mail} onClick={closeMenu}>Contact</DrawerLink>
              </div>
            </div>

            {/* Account */}
            {user ? (
              <div>
                <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Account
                </p>
                <div className="space-y-0.5">
                  <DrawerLink href="/dashboard" icon={LayoutDashboard} onClick={closeMenu}>
                    Dashboard
                  </DrawerLink>
                  {user.role === 'admin' && (
                    <DrawerLink href="/admin/dashboard" icon={ShieldCheck} onClick={closeMenu}>
                      Admin panel
                    </DrawerLink>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-1">
                <Link href="/login" onClick={closeMenu}>
                  <Button className="w-full" size="sm">Sign in</Button>
                </Link>
              </div>
            )}

          </div>
        </div>
      </header>
    </>
  )
}