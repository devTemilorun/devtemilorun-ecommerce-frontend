'use client'

import { useEffect, useState } from 'react'
import { adminService } from '@/services/api/admin.service'
import { StatsCards }   from '@/components/dashboard/stats-cards'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { RecentOrders } from '@/components/dashboard/recent-orders'
import { TopProducts }  from '@/components/dashboard/top-products'
import { RefreshCw, BarChart2 } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const PIE_COLORS = ['#7C3AED','#0891B2','#059669','#D97706','#E11D48','#9333EA','#F43F5E','#0D9488']

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Pending',    color: '#D97706' },
  paid:            { label: 'Paid',       color: '#2563EB' },
  processing:      { label: 'Processing', color: '#7C3AED' },
  shipped:         { label: 'Shipped',    color: '#0891B2' },
  delivered:       { label: 'Delivered',  color: '#059669' },
  cancelled:       { label: 'Cancelled',  color: '#E11D48' },
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-border bg-card p-2.5 shadow-xl text-xs">
      <p className="font-semibold">{d.name}</p>
      <p className="text-muted-foreground mt-0.5">
        Count: <span className="text-foreground font-medium">{d.value}</span>
      </p>
      {d.pct && <p className="text-muted-foreground">Share: <span className="font-medium">{d.pct}%</span></p>}
    </div>
  )
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
}

export default function AdminAnalyticsPage() {
  const [data, setData]         = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [lastUpdate, setLast]   = useState(new Date())

  const load = async () => {
    setLoading(true)
    try {
      const [dashboard, revenue, customers] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRevenueStats(),
        adminService.getCustomerStats(),
      ])
      setData({ ...dashboard, revenue, customers })
      setLast(new Date())
    } catch (e) {
      console.error('Analytics fetch failed:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── Derived data ───────────────────────────────────────────────────────────
  const total = (data?.categories_data ?? []).reduce((s: number, c: any) => s + c.value, 0)
  const pieData = (data?.categories_data ?? []).map((c: any) => ({
    ...c,
    pct: total > 0 ? ((c.value / total) * 100).toFixed(1) : '0',
  }))

  const statusChart = Object.entries(data?.orders_by_status ?? {}).map(([k, v]) => ({
    name:  STATUS_MAP[k]?.label ?? k,
    value: v as number,
    color: STATUS_MAP[k]?.color ?? '#64748B',
  }))

  const customerKpis = [
    { label: 'Total Customers',    value: data?.customers?.total_customers   ?? data?.total_customers  ?? 0 },
    { label: 'New This Month',     value: data?.customers?.new_customers      ?? 0 },
    { label: 'Repeat Customers',   value: data?.customers?.repeat_customers   ?? 0 },
    { label: 'Avg Order Value',    value: `₦${Number(data?.revenue?.average_order_value ?? 0).toFixed(0)}` },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-violet-500" /> Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time store performance from your database
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          {lastUpdate.toLocaleTimeString()}
        </button>
      </div>

      {/* KPI cards */}
      <StatsCards data={data} loading={loading} />

      {/* Revenue chart */}
      <RevenueChart data={data?.revenue_by_day ?? []} loading={loading} />

      {/* Middle row */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Category pie */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-1">Category Distribution</h2>
          <p className="text-xs text-muted-foreground mb-3">By product count / sales</p>
          <div className="h-44">
            {loading
              ? <Skeleton className="h-full rounded-2xl" />
              : pieData.length > 0
                ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={64}
                        paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {pieData.map((_: any, i: number) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )
                : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No data</div>
            }
          </div>
          {!loading && pieData.slice(0, 5).map((c: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-xs mt-1">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {c.name}
              </span>
              <span className="font-medium">{c.pct}%</span>
            </div>
          ))}
        </div>

        {/* Order status bar */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-1">Orders by Status</h2>
          <p className="text-xs text-muted-foreground mb-3">Current breakdown</p>
          <div className="h-52">
            {loading
              ? <Skeleton className="h-full rounded-2xl" />
              : statusChart.length > 0
                ? (
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
                )
                : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No orders yet</div>
            }
          </div>
        </div>

        {/* Customer KPIs */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-1">Customer Insights</h2>
          <p className="text-xs text-muted-foreground mb-4">From your database</p>
          <div className="space-y-3">
            {customerKpis.map((k, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                <span className="text-xs text-muted-foreground">{k.label}</span>
                {loading
                  ? <Skeleton className="h-4 w-12" />
                  : <span className="text-sm font-bold text-foreground">{k.value}</span>
                }
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top products + recent orders */}
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <TopProducts products={data?.top_products ?? []} loading={loading} />
        </div>
        <div className="lg:col-span-3">
          <RecentOrders orders={data?.recent_orders ?? []} loading={loading} />
        </div>
      </div>

    </div>
  )
}