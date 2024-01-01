'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag, DollarSign, TrendingUp, Clock,
  ArrowRight, Package, CheckCircle, XCircle,
  Truck, CreditCard, RefreshCw,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import api from '@/lib/axios'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Types
interface DashboardStats {
  total_orders: number
  total_spent: number
  avg_order_value: number
  pending_orders: number
  processing_orders: number
  completed_orders: number
  monthly_data: Array<{ month: string; orders: number; revenue: number }>
  status_counts: {
    pending: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
  }
  recent_orders: Array<{
    id: number
    order_number: string
    total: number
    status: string
    created_at: string
  }>
  top_products: Array<{
    id: number
    name: string
    sales_count: number
    price: number
  }>
  category_distribution: Array<{
    name: string
    slug: string
    count: number
    percentage: number
  }>
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending_payment: { label: 'Pending Payment', color: '#D97706', bg: '#FEF3C7', icon: Clock },
  paid:            { label: 'Paid',            color: '#2563EB', bg: '#DBEAFE', icon: CreditCard },
  processing:      { label: 'Processing',      color: '#7C3AED', bg: '#EDE9FE', icon: RefreshCw },
  shipped:         { label: 'Shipped',         color: '#0891B2', bg: '#CFFAFE', icon: Truck },
  delivered:       { label: 'Delivered',       color: '#059669', bg: '#D1FAE5', icon: CheckCircle },
  cancelled:       { label: 'Cancelled',       color: '#E11D48', bg: '#FFE4E6', icon: XCircle },
}

const fmtMoney = (n: number) =>
  `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? { label: status, color: '#64748B', bg: '#F1F5F9', icon: Package }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

function KpiCard({ icon: Icon, label, value, sub, accent, loading }: any) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-8"
        style={{ background: accent }} />
      <div className="flex items-start justify-between">
        <div className="rounded-xl p-2.5" style={{ background: `${accent}18` }}>
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
      </div>
      <div className="mt-4">
        {loading
          ? <><Skeleton className="h-7 w-28 mb-1" /><Skeleton className="h-3 w-20" /></>
          : <>
              <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{sub ?? label}</p>
            </>
        }
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-2xl" style={{ background: accent }} />
    </div>
  )
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card p-2.5 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1 text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-medium text-foreground">
            {p.name === 'Revenue' ? `₦${Number(p.value).toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function EmptyOrders({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 rounded-full bg-violet-50 dark:bg-violet-900/20 p-5">
        <ShoppingBag className="h-10 w-10 text-violet-400" />
      </div>
      <h3 className="text-lg font-semibold mb-1">No orders yet, {name}!</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Browse our collection and place your first order to start tracking your purchases here.
      </p>
      <Button asChild>
        <Link href="/shop">Start Shopping →</Link>
      </Button>
    </div>
  )
}

export default function DashboardPage() {
  const { user, token } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !user) { 
      router.push('/login')
      return 
    }
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await api.get('/analytics/user')
        const data = response.data?.data ?? response.data
        
        setStats({
          total_orders: data.total_orders || 0,
          total_spent: data.total_spent || 0,
          avg_order_value: data.avg_order_value || 0,
          pending_orders: data.pending_orders || 0,
          processing_orders: data.processing_orders || 0,
          completed_orders: data.completed_orders || 0,
          monthly_data: data.monthly_data || [],
          status_counts: data.status_counts || {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
          },
          recent_orders: data.recent_orders || [],
          top_products: data.top_products || [],
          category_distribution: data.category_distribution || []
        })
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err)
        if (err?.response?.status === 401) {
          router.push('/login')
          return
        }
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [token, user, router])

  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const totalActiveOrders = (stats?.pending_orders || 0) + (stats?.processing_orders || 0)

  const kpis = [
    { icon: ShoppingBag, label: 'Total Orders',     value: stats?.total_orders ?? 0,                     sub: 'All time',              accent: '#7C3AED' },
    { icon: DollarSign,  label: 'Total Spent',      value: fmtMoney(stats?.total_spent ?? 0),             sub: 'Lifetime value',        accent: '#059669' },
    { icon: TrendingUp,  label: 'Avg Order Value',  value: fmtMoney(stats?.avg_order_value ?? 0),         sub: 'Per order',             accent: '#0891B2' },
    { icon: Clock,       label: 'Active Orders',    value: totalActiveOrders,                              sub: 'Pending + processing',  accent: '#D97706' },
  ]

  const chartData = (stats?.monthly_data ?? []).map((m) => ({
    month: m.month,
    Orders: m.orders,
    Revenue: m.revenue,
  }))

  const statusSummary = [
    { key: 'pending_payment', count: stats?.status_counts?.pending ?? 0 },
    { key: 'processing',      count: stats?.status_counts?.processing ?? 0 },
    { key: 'shipped',         count: stats?.status_counts?.shipped ?? 0 },
    { key: 'delivered',       count: stats?.status_counts?.delivered ?? 0 },
    { key: 'cancelled',       count: stats?.status_counts?.cancelled ?? 0 },
  ].filter(s => s.count > 0)

  const recentOrders = stats?.recent_orders ?? []
  const topProducts = stats?.top_products ?? []
  const categoryDistribution = stats?.category_distribution ?? []
  const isEmpty = !loading && (stats?.total_orders ?? 0) === 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="mt-4 h-7 w-28" />
              <Skeleton className="mt-1 h-3 w-20" />
            </div>
          ))}
        </div>
        <Skeleton className="h-60 w-full rounded-2xl" />
        <div className="grid gap-4 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-full bg-red-50 dark:bg-red-900/20 p-5">
          <XCircle className="h-10 w-10 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Something went wrong</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (isEmpty) return <EmptyOrders name={firstName} />

  return (
    <div className="space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Welcome back, {firstName} 
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Here's a summary of your account activity
          </p>
        </div>
        <Link href="/shop">
          <Button size="sm" className="gap-1.5 text-xs">
            <ShoppingBag className="h-3.5 w-3.5" /> Shop Now
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => <KpiCard key={k.label} {...k} loading={false} />)}
      </div>

      {/* Category Distribution & Order Status */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Category Distribution */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">Category Distribution</h2>
          {categoryDistribution.length > 0 ? (
            <div className="space-y-3">
              {categoryDistribution.map((cat) => (
                <div key={cat.slug}>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{cat.name}</span>
                    <span className="font-medium">{cat.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-violet-500 transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No category data available</p>
          )}
        </div>

        {/* Order Status */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">Orders by Status</h2>
          {statusSummary.length > 0 ? (
            <div className="space-y-3">
              {statusSummary.map(({ key, count }) => {
                const cfg = STATUS_MAP[key] ?? { label: key, color: '#64748B', bg: '#F1F5F9', icon: Package }
                const Icon = cfg.icon
                const total = stats?.total_orders || 1
                const percentage = (count / total) * 100
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <Icon className="h-3 w-3" style={{ color: cfg.color }} />
                        <span className="text-muted-foreground">{cfg.label}</span>
                      </span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ width: `${percentage}%`, background: cfg.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No order status data available</p>
          )}
        </div>
      </div>

      {/* Monthly Activity Chart */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Monthly Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Orders and revenue over time</p>
          </div>
        </div>
        <div className="h-48">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="o" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={24} />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} tickLine={false}
                  axisLine={false} width={48}
                  tickFormatter={v => v >= 1000 ? `₦${(v/1000).toFixed(0)}k` : `₦${v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Area yAxisId="o" type="monotone" dataKey="Orders" stroke="#7C3AED"
                  strokeWidth={2} fill="url(#gOrders)" dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
                <Area yAxisId="r" type="monotone" dataKey="Revenue"  stroke="#059669"
                  strokeWidth={2} fill="url(#gRevenue)"  dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No monthly data yet
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Top Products</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Best selling items</p>
            </div>
            <Link href="/dashboard/orders"
              className="flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {topProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
                    <Package className="h-4 w-4 text-violet-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.sales_count || 0} sold
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {fmtMoney(product.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Your latest purchases</p>
          </div>
          <Link href="/dashboard/orders"
            className="flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="divide-y divide-border">
            {recentOrders.slice(0, 6).map((order) => (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
                    <Package className="h-4 w-4 text-violet-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('en', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-3">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {fmtMoney(order.total)}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground">No recent orders</p>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="flex items-start gap-3 rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 px-5 py-4">
        <div className="rounded-full bg-violet-100 dark:bg-violet-800 p-1.5 shrink-0 mt-0.5">
          <Clock className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300" />
        </div>
        <div>
          <p className="text-xs font-semibold text-violet-900 dark:text-violet-100">Real-time updates</p>
          <p className="text-xs text-violet-700 dark:text-violet-300 mt-0.5">
            You'll receive email notifications whenever your order status changes. Check your inbox after placing an order.
          </p>
        </div>
      </div>

    </div>
  )
}