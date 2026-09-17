'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { adminService } from '@/services/api/admin.service'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, Truck, CheckCircle, Clock, CreditCard, RefreshCw, XCircle, Mail, MapPin, User } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  product_sku: string
  unit_price: number
  quantity: number
  total: number
}

interface OrderAddress {
  first_name: string
  last_name: string
  email: string
  phone?: string // Made optional
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

interface Order {
  id: number
  order_number: string
  status: string
  subtotal: number
  tax: number
  shipping_cost: number
  discount: number
  total: number
  shipping_address: OrderAddress | string | null
  payment_method: string
  paid_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  notes: string | null
  created_at: string
  user: {
    id: number
    name: string
    email: string
  }
  items: OrderItem[]
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending_payment: { label: 'Pending Payment', color: '#D97706', bg: '#FEF3C7', icon: Clock },
  paid:            { label: 'Paid',            color: '#2563EB', bg: '#DBEAFE', icon: CreditCard },
  processing:      { label: 'Processing',      color: '#7C3AED', bg: '#EDE9FE', icon: RefreshCw },
  shipped:         { label: 'Shipped',         color: '#0891B2', bg: '#CFFAFE', icon: Truck },
  delivered:       { label: 'Delivered',       color: '#059669', bg: '#D1FAE5', icon: CheckCircle },
  cancelled:       { label: 'Cancelled',       color: '#E11D48', bg: '#FFE4E6', icon: XCircle },
}

const STATUSES = Object.keys(STATUS_MAP)
const fmtMoney = (n: number) => `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? { label: status, color: '#64748B', bg: '#F1F5F9', icon: Package }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  async function fetchOrder() {
    setLoading(true)
    try {
      const data = await adminService.getOrder(Number(id))
      console.log('Order data:', data)
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order:', error)
      toast({ title: 'Error', description: 'Could not load order.', variant: 'destructive' })
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { 
    fetchOrder() 
  }, [id])

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true)
    try {
      await adminService.updateOrderStatus(Number(id), newStatus)
      toast({ title: 'Status updated', description: `Order is now ${STATUS_MAP[newStatus]?.label}` })
      fetchOrder()
    } catch (error) {
      console.error('Error updating status:', error)
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' })
    } finally { 
      setUpdating(false) 
    }
  }

  const getShippingAddress = (order: Order | null): OrderAddress | null => {
    if (!order) return null
    
    if (typeof order.shipping_address === 'object' && order.shipping_address !== null) {
      return order.shipping_address as OrderAddress
    }
    
    if (typeof order.shipping_address === 'string') {
      try {
        return JSON.parse(order.shipping_address) as OrderAddress
      } catch (e) {
        console.error('Failed to parse shipping address:', e)
        return null
      }
    }
    
    return null
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!order) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Package className="h-10 w-10 text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground mb-4">Order not found</p>
      <Button asChild size="sm" variant="outline">
        <Link href="/admin/orders">← Back to orders</Link>
      </Button>
    </div>
  )

  const address = getShippingAddress(order)
  const StatusIcon = STATUS_MAP[order.status]?.icon ?? Package

  return (
    <div className="space-y-5">

      <div className="flex items-start gap-3">
        <Link href="/admin/orders">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full mt-0.5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-lg font-bold tracking-tight">{order.order_number}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Placed {new Date(order.created_at).toLocaleString('en', {
              weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">

        <div className="lg:col-span-2 space-y-4">

          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold">Order Items</h2>
              <span className="text-xs text-muted-foreground">{order.items?.length ?? 0} items</span>
            </div>
            <div className="divide-y divide-border">
              {order.items?.map((item: OrderItem) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3.5 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {item.product_sku} · {item.quantity} × {fmtMoney(item.unit_price)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold tabular-nums shrink-0">{fmtMoney(item.total)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border px-5 py-4 space-y-2 bg-muted/20">
              {[
                { label: 'Subtotal',   value: order.subtotal },
                { label: 'Shipping',   value: order.shipping_cost },
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

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold mb-3">Customer</h2>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-sm font-bold text-violet-600 shrink-0">
                {order.user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{order.user?.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Mail className="h-3 w-3" /> {order.user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold mb-4">Update Status</h2>
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl"
              style={{ background: STATUS_MAP[order.status]?.bg ?? '#F1F5F9' }}>
              <StatusIcon className="h-4 w-4 shrink-0"
                style={{ color: STATUS_MAP[order.status]?.color ?? '#64748B' }} />
              <p className="text-xs font-semibold" style={{ color: STATUS_MAP[order.status]?.color ?? '#64748B' }}>
                Currently: {STATUS_MAP[order.status]?.label ?? order.status}
              </p>
            </div>
            <select value={order.status}
              onChange={e => handleStatusUpdate(e.target.value)}
              disabled={updating}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 mb-3">
              {STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_MAP[s].label}</option>
              ))}
            </select>
            {updating && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" /> Updating…
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Changing status will automatically email the customer.
            </p>
          </div>

          {(order.paid_at || order.shipped_at || order.delivered_at) && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold mb-3">Timeline</h2>
              <div className="space-y-2">
                {order.paid_at && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Paid at</span>
                    <span className="font-medium">{new Date(order.paid_at).toLocaleDateString()}</span>
                  </div>
                )}
                {order.shipped_at && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Shipped at</span>
                    <span className="font-medium">{new Date(order.shipped_at).toLocaleDateString()}</span>
                  </div>
                )}
                {order.delivered_at && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Delivered at</span>
                    <span className="font-medium">{new Date(order.delivered_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Shipping Address Section - Phone removed, email from user displayed */}
          {address ? (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Shipping Address
              </h2>
              <div className="space-y-1.5 text-sm">
                <p className="font-medium text-foreground">
                  {address.first_name} {address.last_name}
                </p>
                <p className="text-muted-foreground">
                  {address.address_line1}
                  {address.address_line2 && <>, {address.address_line2}</>}
                </p>
                <p className="text-muted-foreground">
                  {address.city}, {address.state} {address.postal_code}
                </p>
                <p className="text-muted-foreground">{address.country}</p>
                {/* ✅ Display user email from order, not from address */}
                <div className="flex items-center gap-2 pt-2 text-muted-foreground border-t border-border mt-2">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{order.user?.email}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Shipping Address
              </h2>
              <p className="text-sm text-muted-foreground">No shipping address available</p>
              {/* ✅ Still show user email even if no address */}
              <div className="flex items-center gap-2 pt-2 text-muted-foreground border-t border-border mt-2">
                <Mail className="h-3.5 w-3.5" />
                <span>{order.user?.email}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}