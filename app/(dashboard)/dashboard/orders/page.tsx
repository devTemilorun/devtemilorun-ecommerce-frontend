'use client'

import { useQuery } from '@tanstack/react-query'
import { orderService } from '@/services/api/order.service'
import { Package, ArrowRight, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending_payment: { label: 'Pending Payment', color: '#D97706', bg: '#FEF3C7' },
  paid:            { label: 'Paid',            color: '#2563EB', bg: '#DBEAFE' },
  processing:      { label: 'Processing',      color: '#7C3AED', bg: '#EDE9FE' },
  shipped:         { label: 'Shipped',         color: '#0891B2', bg: '#CFFAFE' },
  delivered:       { label: 'Delivered',       color: '#059669', bg: '#D1FAE5' },
  cancelled:       { label: 'Cancelled',       color: '#E11D48', bg: '#FFE4E6' },
}

const fmtMoney = (n: number) =>
  `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? { label: status, color: '#64748B', bg: '#F1F5F9' }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

const STEPS = ['pending_payment', 'paid', 'processing', 'shipped', 'delivered']

function StatusProgress({ status }: { status: string }) {
  if (status === 'cancelled') return null
  const idx = STEPS.indexOf(status)
  const pct = idx < 0 ? 0 : Math.round(((idx + 1) / STEPS.length) * 100)
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Order placed</span>
        <span>Delivered</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-violet-500 transition-all duration-700"
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: () => orderService.getOrders(),
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40 mb-6" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <div className="flex items-center justify-between mt-4">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-full bg-violet-50 dark:bg-violet-900/20 p-5">
          <ShoppingBag className="h-10 w-10 text-violet-400" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No orders yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          You haven't placed any orders. Browse our store and find something you love.
        </p>
        <Button asChild>
          <Link href="/shop">Start Shopping →</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">My Orders</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {orders.length} order{orders.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link href="/shop">
          <Button size="sm" variant="outline" className="text-xs gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5" /> Shop More
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {orders.map((order: any) => {
          const itemCount = order.items?.length ?? 0
          return (
            <Link key={order.id} href={`/dashboard/orders/${order.id}`}
              className="block rounded-2xl border border-border bg-card p-5 shadow-sm
                hover:shadow-md hover:border-violet-200 dark:hover:border-violet-700
                transition-all duration-200 group">

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="rounded-xl bg-violet-50 dark:bg-violet-900/20 p-2 shrink-0 mt-0.5">
                    <Package className="h-4 w-4 text-violet-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en', {
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                      })}
                      {itemCount > 0 && ` · ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <StatusProgress status={order.status} />

              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="text-lg font-bold text-foreground tabular-nums">
                    {fmtMoney(order.total)}
                  </p>
                  {order.status === 'pending_payment' && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                       Payment pending
                    </p>
                  )}
                  {order.status === 'shipped' && (
                    <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-0.5">
                      On its way to you
                    </p>
                  )}
                  {order.status === 'delivered' && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Delivered
                    </p>
                  )}
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-violet-600
                  dark:text-violet-400 group-hover:gap-2 transition-all">
                  View details <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}