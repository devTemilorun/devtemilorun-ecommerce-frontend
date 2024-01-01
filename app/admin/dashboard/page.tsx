'use client'

import { useEffect, useState } from 'react'
import { adminService } from '@/services/api/admin.service'
import {
  DollarSign, ShoppingBag, Users, Package,
  ArrowUpRight, ArrowDownRight, TrendingUp,
  Clock, RefreshCw,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts'

const C = {
  violet:  '#7C3AED',
  indigo:  '#4338CA',
  cyan:    '#0891B2',
  emerald: '#059669',
  amber:   '#D97706',
  rose:    '#E11D48',
  slate:   '#475569',
  purple:  '#9333EA',
  teal:    '#0D9488',
  orange:  '#EA580C',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending_payment: { label: 'Pending',    color: '#D97706', bg: '#FEF3C7' },
  paid:            { label: 'Paid',       color: '#059669', bg: '#D1FAE5' },
  processing:      { label: 'Processing', color: '#4338CA', bg: '#E0E7FF' },
  shipped:         { label: 'Shipped',    color: '#0891B2', bg: '#CFFAFE' },
  delivered:       { label: 'Delivered',  color: '#059669', bg: '#D1FAE5' },
  cancelled:       { label: 'Cancelled',  color: '#E11D48', bg: '#FFE4E6' },
  refunded:        { label: 'Refunded',   color: '#475569', bg: '#F1F5F9' },
}

const PIE_COLORS = [C.violet, C.cyan, C.emerald, C.amber, C.rose, C.purple]

const fmt = (n: number) =>
  n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `₦${(n / 1_000).toFixed(1)}k`
  : `₦${n.toFixed(0)}`

const fmtFull = (n: number) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`


function KpiCard({ title, value, sub, icon: Icon, accent, growth, trend }: any) {
  const up = trend === 'up'
  return (
    <div className="relative rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-10"
        style={{ background: accent }} />

      <div className="flex items-start justify-between">
        <div className="rounded-xl p-2.5" style={{ background: `${accent}18` }}>
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
        <span className={`flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-0.5
          ${up ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
               : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'}`}>
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {growth}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{title}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-2xl" style={{ background: accent }} />
    </div>
  )
}

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-xl text-xs min-w-35">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-semibold text-foreground">
            {p.name === 'Revenue' ? fmt(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground">{d.name}</p>
      <p className="text-muted-foreground mt-1">
        Count: <span className="text-foreground font-medium">{d.value}</span>
      </p>
      {d.pct !== undefined && (
        <p className="text-muted-foreground">
          Share: <span className="text-foreground font-medium">{d.pct}%</span>
        </p>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: '#64748B', bg: '#F1F5F9' }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <div className="rounded-full bg-muted p-3">
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}


export default function AdminDashboard() {
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const load = async () => {
    setLoading(true)
    try {
      const d = await adminService.getDashboardStats()
      setData(d)
      setLastRefresh(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])


  const revenueChart = (data?.revenue_by_day ?? []).map((r: any) => ({
    day: new Date(r.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    Revenue: Number(r.revenue),
    Orders: Number(r.orders),
  }))

  const total = (data?.categories_data ?? []).reduce((s: number, c: any) => s + c.value, 0)
  const pieData = (data?.categories_data ?? []).map((c: any) => ({
    ...c,
    pct: total > 0 ? ((c.value / total) * 100).toFixed(1) : '0',
  }))

  const statusChart = Object.entries(data?.orders_by_status ?? {}).map(([k, v]) => ({
    name: STATUS_CONFIG[k]?.label ?? k,
    value: v as number,
    color: STATUS_CONFIG[k]?.color ?? C.slate,
  }))

  const kpis = [
    {
      title: 'Total Revenue',
      value: fmtFull(data?.total_revenue ?? 0),
      sub:   'All confirmed orders',
      icon:  DollarSign,
      accent: C.violet,
      growth: data?.revenue_growth ?? '+0%',
      trend: (data?.revenue_growth ?? '').startsWith('+') ? 'up' : 'down',
    },
    {
      title: 'Total Orders',
      value: (data?.total_orders ?? 0).toLocaleString(),
      sub:   'All time',
      icon:  ShoppingBag,
      accent: C.cyan,
      growth: data?.orders_growth ?? '+0%',
      trend: (data?.orders_growth ?? '').startsWith('+') ? 'up' : 'down',
    },
    {
      title: 'Customers',
      value: (data?.total_customers ?? 0).toLocaleString(),
      sub:   'Registered buyers',
      icon:  Users,
      accent: C.emerald,
      growth: data?.customers_growth ?? '+0%',
      trend: (data?.customers_growth ?? '').startsWith('+') ? 'up' : 'down',
    },
    {
      title: 'Products',
      value: (data?.total_products ?? 0).toLocaleString(),
      sub:   'In catalogue',
      icon:  Package,
      accent: C.amber,
      growth: data?.products_growth ?? '+0%',
      trend: (data?.products_growth ?? '').startsWith('+') ? 'up' : 'down',
    },
  ]


  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-violet-500 border-t-transparent" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading dashboard…</p>
      </div>
    )
  }


  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Store overview · Last 30 days
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-1.5 self-start rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh · {lastRefresh.toLocaleTimeString()}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Revenue & Orders — Last 30 Days</h2>
            <p className="text-xs text-muted-foreground mt-0.5">All orders included</p>
          </div>
          <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2 py-1 rounded-full">
            {data?.revenue_growth ?? '—'} growth
          </span>
        </div>
        <div className="h-56">
          {revenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={C.violet} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={C.violet} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gO" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={C.cyan} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={C.cyan} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis yAxisId="rev" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={fmt} width={52} />
                <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                <Tooltip content={<RevenueTooltip />} />
                <Area yAxisId="rev" type="monotone" dataKey="Revenue"
                  stroke={C.violet} strokeWidth={2} fill="url(#gR)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Area yAxisId="ord" type="monotone" dataKey="Orders"
                  stroke={C.cyan} strokeWidth={2} fill="url(#gO)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyState text="No order data in the last 30 days" />}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-1">Category Distribution</h2>
          <p className="text-xs text-muted-foreground mb-4">By product count / sales</p>
          <div className="h-52">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="48%" innerRadius={48} outerRadius={74}
                    paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {pieData.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState text="No category data" />}
          </div>
          <div className="mt-2 space-y-1">
            {pieData.slice(0, 5).map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full shrink-0"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {c.name}
                </span>
                <span className="font-medium text-foreground">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-1">Orders by Status</h2>
          <p className="text-xs text-muted-foreground mb-4">Current distribution</p>
          <div className="h-52">
            {statusChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChart} layout="vertical"
                  margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false}
                    axisLine={false} width={72} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))',
                      background: 'hsl(var(--background))', fontSize: 12 }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={14}>
                    {statusChart.map((s: any, i: number) => (
                      <Cell key={i} fill={s.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState text="No orders yet" />}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-1">Top Products</h2>
          <p className="text-xs text-muted-foreground mb-4">By sales count</p>
          <div className="space-y-3">
            {(data?.top_products ?? []).slice(0, 6).map((p: any, i: number) => {
              const maxSales = data?.top_products?.[0]?.sales_count || 1
              const pct = maxSales > 0 ? Math.round((p.sales_count / maxSales) * 100) : 0
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-foreground truncate max-w-40">{p.name}</span>
                    <span className="text-muted-foreground ml-2 shrink-0">{p.sales_count ?? 0} sold</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  </div>
                </div>
              )
            })}
            {(data?.top_products ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">No product data yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest 8 orders</p>
          </div>
          <a href="/admin/orders"
            className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline">
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                {['Order', 'Customer', 'Status', 'Total', 'Date'].map((h) => (
                  <th key={h} className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.recent_orders ?? []).map((order: any, i: number) => (
                <tr key={order.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                    {order.order_number}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}>
                        {order.user?.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="font-medium text-foreground truncate max-w-35">
                        {order.user?.name ?? 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3 font-semibold tabular-nums">
                    {fmtFull(order.total)}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('en', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
              {(data?.recent_orders ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}