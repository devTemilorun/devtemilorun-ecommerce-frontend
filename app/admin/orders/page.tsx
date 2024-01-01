'use client'

import { useEffect, useState } from 'react'
import { adminService } from '@/services/api/admin.service'
import { Button } from '@/components/ui/button'
import { Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending_payment: { label: 'Pending',    color: '#D97706', bg: '#FEF3C7' },
  paid:            { label: 'Paid',       color: '#2563EB', bg: '#DBEAFE' },
  processing:      { label: 'Processing', color: '#7C3AED', bg: '#EDE9FE' },
  shipped:         { label: 'Shipped',    color: '#0891B2', bg: '#CFFAFE' },
  delivered:       { label: 'Delivered',  color: '#059669', bg: '#D1FAE5' },
  cancelled:       { label: 'Cancelled',  color: '#E11D48', bg: '#FFE4E6' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? { label: status, color: '#64748B', bg: '#F1F5F9' }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

const STATUSES = Object.keys(STATUS_MAP)
const fmtMoney = (n: number) => `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`

export default function AdminOrdersPage() {
  const [orders, setOrders]           = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [statusFilter, setFilter]     = useState('')
  const [page, setPage]               = useState(1)
  const [totalPages, setTotalPages]   = useState(1)
  const [total, setTotal]             = useState(0)
  const [updatingId, setUpdatingId]   = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => { fetchOrders() }, [page, statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await adminService.getOrders(page, statusFilter)
      setOrders(data.data || [])
      setTotalPages(data.last_page || 1)
      setTotal(data.total || 0)
    } finally { setLoading(false) }
  }

  const handleStatusUpdate = async (id: number, status: string) => {
    setUpdatingId(id)
    try {
      await adminService.updateOrderStatus(id, status)
      toast({ title: 'Status updated', description: `Order marked as ${STATUS_MAP[status]?.label ?? status}` })
      fetchOrders()
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
    } finally { setUpdatingId(null) }
  }

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Orders</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {loading ? '…' : `${total} order${total !== 1 ? 's' : ''} total`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <button onClick={() => { setFilter(''); setPage(1) }}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            statusFilter === ''
              ? 'bg-violet-600 text-white'
              : 'border border-border text-muted-foreground hover:bg-muted'
          }`}>All</button>
        {STATUSES.map(s => {
          const cfg = STATUS_MAP[s]
          return (
            <button key={s} onClick={() => { setFilter(s); setPage(1) }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === s ? 'text-white' : 'border border-border text-muted-foreground hover:bg-muted'
              }`}
              style={statusFilter === s ? { background: cfg.color } : {}}>
              {cfg.label}
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Update Status', ''].map(h => (
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
                      {[...Array(8)].map((_, j) => (
                        <td key={j} className="px-4 py-4"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                : orders.length === 0
                  ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-sm text-muted-foreground">
                        No orders found
                      </td>
                    </tr>
                  )
                  : orders.map(order => (
                    <tr key={order.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4">
                        <p className="font-mono text-xs font-medium text-foreground">{order.order_number}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0">
                            {order.user?.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground truncate max-w-30">{order.user?.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-30">{order.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground text-xs">
                        {order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-4 font-semibold tabular-nums">{fmtMoney(order.total)}</td>
                      <td className="px-4 py-4"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('en', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <select value={order.status}
                          onChange={e => handleStatusUpdate(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50">
                          {STATUSES.map(s => (
                            <option key={s} value={s}>{STATUS_MAP[s].label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <Link href={`/admin/orders/${order.id}`}>
                          <button className="rounded-lg p-1.5 text-muted-foreground hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
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