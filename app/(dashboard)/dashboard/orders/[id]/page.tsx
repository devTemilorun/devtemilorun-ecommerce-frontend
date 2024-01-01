'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { orderService } from '@/services/api/order.service'
import { ArrowLeft, Package, CheckCircle, Clock, XCircle, Truck, CreditCard, RefreshCw } from 'lucide-react'
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

const STEPS = [
  { key: 'pending_payment', label: 'Order Placed',       icon: Package,    desc: 'We received your order' },
  { key: 'paid',            label: 'Payment Confirmed',  icon: CreditCard, desc: 'Payment verified successfully' },
  { key: 'processing',      label: 'Processing',         icon: RefreshCw,  desc: 'Order is being prepared' },
  { key: 'shipped',         label: 'Shipped',            icon: Truck,      desc: 'Order is on its way' },
  { key: 'delivered',       label: 'Delivered',          icon: CheckCircle,desc: 'Order completed' },
]

const fmtMoney = (n: number) =>
  `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? { label: status, color: '#64748B', bg: '#F1F5F9' }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrder(Number(id)),
    staleTime: 30_000,
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="font-semibold">Order not found</h3>
        <Button asChild className="mt-4" variant="outline" size="sm">
          <Link href="/dashboard/orders">← Back to Orders</Link>
        </Button>
      </div>
    )
  }

  const isCancelled = order.status === 'cancelled'
  const currentIdx  = STEPS.findIndex(s => s.key === order.status)
  const addr        = order.shipping_address

  return (
    <div className="space-y-5">

      <div className="flex items-start gap-3">
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full mt-0.5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-bold tracking-tight">{order.order_number}</h1>
          <p className="text-xs text-muted-foreground">
            Placed {new Date(order.created_at).toLocaleDateString('en', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={order.status} />
        </div>
      </div>

      {isCancelled && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 px-5 py-4">
          <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">Order Cancelled</p>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
              This order has been cancelled. Contact support if you think this is a mistake.
            </p>
          </div>
        </div>
      )}

      {!isCancelled && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-5">Order Progress</h2>
          <div className="relative">
            <div className="absolute left-5 top-5 bottom-5 w-px bg-border" />

            <div className="space-y-6">
              {STEPS.map((step, i) => {
                const done    = i <= currentIdx
                const current = i === currentIdx
                const Icon    = step.icon
                return (
                  <div key={step.key} className="relative flex items-start gap-4">
                    <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center
                      rounded-full border-2 transition-all ${
                        done
                          ? 'border-violet-500 bg-violet-500'
                          : 'border-border bg-card'
                      }`}>
                      <Icon className={`h-4 w-4 ${done ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>

                    <div className="pt-1.5">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${done ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {step.label}
                        </p>
                        {current && (
                          <span className="rounded-full bg-violet-100 dark:bg-violet-900/40 px-2 py-0.5 text-xs font-medium text-violet-600 dark:text-violet-400">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">

        <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Order Items</h2>
          </div>
          <div className="divide-y divide-border">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between px-5 py-3.5 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {fmtMoney(item.unit_price)}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground tabular-nums shrink-0">
                  {fmtMoney(item.total)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-border px-5 py-4 space-y-2">
            {[
              { label: 'Subtotal',  value: order.subtotal },
              { label: 'Shipping',  value: order.shipping_cost },
              { label: 'Tax (10%)', value: order.tax },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-xs text-muted-foreground">
                <span>{label}</span>
                <span>{fmtMoney(value)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-sm pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-violet-600 dark:text-violet-400">{fmtMoney(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">

          {addr && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground mb-3">Shipping Address</h2>
              <div className="space-y-0.5 text-xs text-muted-foreground">
                <p className="font-medium text-foreground text-sm">
                  {addr.first_name} {addr.last_name}
                </p>
                <p>{addr.address_line1}</p>
                <p>{addr.city}, {addr.state} {addr.postal_code}</p>
                <p>{addr.country}</p>
                <p className="pt-2">{addr.phone}</p>
                <p>{addr.email}</p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-2">What's next?</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {order.status === 'pending_payment' && 'Complete your payment to confirm your order and begin processing.'}
              {order.status === 'paid'            && 'Payment confirmed! We\'re packing your order and will ship it soon.'}
              {order.status === 'processing'      && 'Your order is being carefully packed and will be shipped very soon.'}
              {order.status === 'shipped'         && 'Your order is on its way! You\'ll receive it in the next few days.'}
              {order.status === 'delivered'       && 'Your order was delivered. We hope you love it! Thank you for shopping with us.'}
              {order.status === 'cancelled'       && 'This order was cancelled. Need help? Contact our support team.'}
            </p>
            {order.status === 'delivered' && (
              <Link href="/shop">
                <Button size="sm" className="w-full mt-3 text-xs">Shop Again</Button>
              </Link>
            )}
            {order.status === 'pending_payment' && (
              <Link href="/shop">
                <Button size="sm" variant="outline" className="w-full mt-3 text-xs">Need Help?</Button>
              </Link>
            )}
          </div>

        </div>
      </div>

    </div>
  )
}