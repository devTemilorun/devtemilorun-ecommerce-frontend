'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
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
            {p.name === 'Revenue'
              ? `₦${Number(p.value).toLocaleString()}`
              : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

interface RevenueChartProps {
  data: any[]
  loading: boolean
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  const chartData = data.map((r: any) => ({
    day: new Date(r.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    Revenue: Number(r.revenue),
    Orders:  Number(r.orders),
  }))

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Revenue & Orders — Last 30 Days</h2>
          <p className="text-xs text-muted-foreground mt-0.5">All orders included</p>
        </div>
      </div>
      <div className="h-56">
        {loading
          ? <Skeleton className="h-full w-full" />
          : chartData.length > 0
            ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#7C3AED" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#0891B2" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#0891B2" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                    interval="preserveStartEnd" />
                  <YAxis yAxisId="rev" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                    width={52} tickFormatter={v => v >= 1000 ? `₦${(v/1000).toFixed(0)}k` : `₦${v}`} />
                  <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 10 }} tickLine={false}
                    axisLine={false} width={28} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area yAxisId="rev" type="monotone" dataKey="Revenue" stroke="#7C3AED"
                    strokeWidth={2} fill="url(#gRev)" dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
                  <Area yAxisId="ord" type="monotone" dataKey="Orders"  stroke="#0891B2"
                    strokeWidth={2} fill="url(#gOrd)" dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )
            : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No order data in the last 30 days
              </div>
            )
        }
      </div>
    </div>
  )
}