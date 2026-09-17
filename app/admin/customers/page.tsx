'use client'

import { useEffect, useState } from 'react'
import { adminService } from '@/services/api/admin.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Eye, Users, ChevronLeft, ChevronRight, ShieldCheck, User } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
}

const AVATAR_COLORS = ['#7C3AED','#0891B2','#059669','#D97706','#E11D48','#9333EA']

export default function AdminCustomersPage() {
  const [customers, setCustomers]   = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [debounced, setDebounced]   = useState('')
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]           = useState(0)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  async function fetchCustomers() {
    setLoading(true)
    try {
      const data = await adminService.getCustomers(page, debounced)
      setCustomers(data.data || [])
      setTotalPages(data.last_page || 1)
      setTotal(data.total || 0)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchCustomers() }, [page, debounced])

  const handleRoleChange = async (id: number, role: string, name: string) => {
    setUpdatingId(id)
    try {
      await adminService.updateCustomerRole(id, role)
      toast({ title: 'Role updated', description: `${name} is now ${role}` })
      fetchCustomers()
    } catch {
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' })
    } finally { setUpdatingId(null) }
  }

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Customers</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {loading ? '…' : `${total} registered customer${total !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name or email…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 rounded-xl border-border bg-card" />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Customer', 'Email', 'Role', 'Orders', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-4 py-4"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                : customers.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No customers found</p>
                      </td>
                    </tr>
                  )
                  : customers.map((c, i) => {
                    const avatarColor = AVATAR_COLORS[c.id % AVATAR_COLORS.length]
                    const isAdmin = c.role === 'admin'
                    return (
                      <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{ background: avatarColor }}>
                              {c.name?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <span className="font-medium text-foreground max-w-35 truncate">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground max-w-40 truncate">
                          {c.email}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            isAdmin
                              ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {isAdmin
                              ? <><ShieldCheck className="h-3 w-3" /> Admin</>
                              : <><User className="h-3 w-3" /> Customer</>
                            }
                          </span>
                        </td>
                        <td className="px-4 py-3.5 tabular-nums text-muted-foreground text-xs">
                          {c.orders_count ?? 0}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(c.created_at).toLocaleDateString('en', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Link href={`/admin/customers/${c.id}`}>
                              <button className="rounded-lg p-1.5 text-muted-foreground hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            </Link>
                            {!isAdmin && (
                              <select value={c.role}
                                onChange={e => handleRoleChange(c.id, e.target.value, c.name)}
                                disabled={updatingId === c.id}
                                className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50">
                                <option value="customer">Customer</option>
                                <option value="admin">Make Admin</option>
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg"
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}