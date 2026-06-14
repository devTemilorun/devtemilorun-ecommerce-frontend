'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from 'cmdk'
import { Home, ShoppingBag, User, Settings, HelpCircle, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { user, logout } = useAuthStore()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push('/'))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/shop'))}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Shop</span>
          </CommandItem>
          {user && (
            <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
              <User className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
          )}
        </CommandGroup>
        
        <CommandSeparator />
        
        {user ? (
          <CommandGroup heading="Account">
            <CommandItem onSelect={() => runCommand(() => router.push('/profile'))}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/settings'))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => logout())}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </CommandItem>
          </CommandGroup>
        ) : (
          <CommandGroup heading="Account">
            <CommandItem onSelect={() => runCommand(() => router.push('/login'))}>
              <User className="mr-2 h-4 w-4" />
              <span>Login</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/register'))}>
              <User className="mr-2 h-4 w-4" />
              <span>Register</span>
            </CommandItem>
          </CommandGroup>
        )}
        
        <CommandSeparator />
        
        <CommandGroup heading="Support">
          <CommandItem onSelect={() => runCommand(() => router.push('/help'))}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help Center</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/contact'))}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Contact Support</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}