'use client'

import Link from 'next/link'
import { ArrowRight, Package } from 'lucide-react'

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

const PIE_COLORS = ['#7C3AED','#0891B2','#059669','#D97706','#E11D48','#9333EA']
const fmtMoney = (n: number) => `₦${Number(n||0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`

interface RecentOrdersProps {
  orders: any[]
  loading: boolean
}

export function RecentOrders({ orders, loading }: RecentOrdersProps) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Latest 8 orders</p>
        </div>
        <Link href="/admin/orders"
          className="flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              {['Order', 'Customer', 'Status', 'Total', 'Date'].map(h => (
                <th key={h} className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : orders.length === 0
                ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No orders yet</p>
                    </td>
                  </tr>
                )
                : orders.map((order: any, i: number) => {
                  const cfg = STATUS_MAP[order.status] ?? { label: order.status, color: '#64748B', bg: '#F1F5F9' }
                  return (
                    <tr key={order.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                        {order.order_number}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}>
                            {order.user?.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                            {order.user?.name ?? 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{ color: cfg.color, background: cfg.bg }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.color }} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold tabular-nums text-xs">
                        {fmtMoney(order.total)}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('en', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}