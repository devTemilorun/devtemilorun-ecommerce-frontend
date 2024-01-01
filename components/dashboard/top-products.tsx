'use client'

import { Package } from 'lucide-react'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
}

const PIE_COLORS = ['#7C3AED','#0891B2','#059669','#D97706','#E11D48','#9333EA']
const fmtMoney = (n: number) => `₦${Number(n||0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`

interface TopProductsProps {
  products: any[]
  loading: boolean
}

export function TopProducts({ products, loading }: TopProductsProps) {
  const maxSales = products[0]?.sales_count || 1

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-foreground mb-1">Top Products</h2>
      <p className="text-xs text-muted-foreground mb-4">By sales count</p>
      <div className="space-y-4">
        {loading
          ? [...Array(5)].map((_, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))
          : products.length === 0
            ? (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <Package className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">No product data yet</p>
              </div>
            )
            : products.slice(0, 8).map((p: any, i: number) => {
              const pct = maxSales > 0 ? Math.round((p.sales_count / maxSales) * 100) : 0
              const revenue = Number(p.price || 0) * Number(p.sales_count || 0)
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}>
                        {i + 1}
                      </span>
                      <span className="font-medium text-foreground truncate max-w-[140px]">{p.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="font-semibold text-foreground">{fmtMoney(revenue)}</span>
                      <span className="text-muted-foreground ml-1">({p.sales_count ?? 0} sold)</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  </div>
                </div>
              )
            })
        }
      </div>
    </div>
  )
}