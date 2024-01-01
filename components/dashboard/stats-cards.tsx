'use client'

import { DollarSign, ShoppingBag, Users, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
}

interface StatsCardsProps {
  data: any
  loading: boolean
}

const CARDS = [
  { key: 'revenue',   title: 'Total Revenue',   growthKey: 'revenue_growth',   icon: DollarSign, accent: '#7C3AED', format: (v: any) => `₦${Number(v||0).toLocaleString()}` },
  { key: 'orders',    title: 'Total Orders',    growthKey: 'orders_growth',    icon: ShoppingBag, accent: '#0891B2', format: (v: any) => Number(v||0).toLocaleString() },
  { key: 'customers', title: 'Customers',       growthKey: 'customers_growth', icon: Users,       accent: '#059669', format: (v: any) => Number(v||0).toLocaleString() },
  { key: 'products',  title: 'Products',        growthKey: 'products_growth',  icon: Package,     accent: '#D97706', format: (v: any) => Number(v||0).toLocaleString() },
]

export function StatsCards({ data, loading }: StatsCardsProps) {
  const values = {
    revenue:   data?.total_revenue,
    orders:    data?.total_orders,
    customers: data?.total_customers,
    products:  data?.total_products,
  }
  const growths = {
    revenue_growth:   data?.revenue_growth   ?? '+0%',
    orders_growth:    data?.orders_growth    ?? '+0%',
    customers_growth: data?.customers_growth ?? '+0%',
    products_growth:  data?.products_growth  ?? '+0%',
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map(({ key, title, growthKey, icon: Icon, accent, format }) => {
        const growth = growths[growthKey as keyof typeof growths]
        const isUp   = String(growth).startsWith('+')
        return (
          <div key={key}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-8"
              style={{ background: accent }} />
            <div className="flex items-start justify-between">
              <div className="rounded-xl p-2.5" style={{ background: `${accent}18` }}>
                <Icon className="h-5 w-5" style={{ color: accent }} />
              </div>
              {!loading && (
                <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isUp
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                }`}>
                  {isUp
                    ? <ArrowUpRight className="h-3 w-3" />
                    : <ArrowDownRight className="h-3 w-3" />}
                  {growth}
                </span>
              )}
            </div>
            <div className="mt-4">
              {loading
                ? <><Skeleton className="h-7 w-28 mb-1" /><Skeleton className="h-3 w-20" /></>
                : <>
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      {format(values[key as keyof typeof values])}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{title}</p>
                  </>
              }
            </div>
            <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-2xl" style={{ background: accent }} />
          </div>
        )
      })}
    </div>
  )
}