'use client'

import { useEffect, useState } from 'react'
import { adminService } from '@/services/api/admin.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2, Star, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: 'Published', color: '#059669', bg: '#D1FAE5' },
  draft:     { label: 'Draft',     color: '#D97706', bg: '#FEF3C7' },
  archived:  { label: 'Archived',  color: '#64748B', bg: '#F1F5F9' },
}

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { label: status, color: '#64748B', bg: '#F1F5F9' }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

export default function AdminProductsPage() {
  const [products, setProducts]     = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [debouncedSearch, setDebounced] = useState('')
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]           = useState(0)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const data = await adminService.getProducts(page, debouncedSearch)
      setProducts(data.data || [])
      setTotalPages(data.last_page || 1)
      setTotal(data.total || 0)
    }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProducts() }, [page, debouncedSearch])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      await adminService.deleteProduct(id)
      toast({ title: 'Deleted', description: `"${name}" has been removed.` })
      fetchProducts()
    } catch {
      toast({ title: 'Error', description: 'Could not delete product.', variant: 'destructive' })
    } finally { setDeletingId(null) }
  }

  const handleToggleFeatured = async (id: number, isFeatured: boolean) => {
    setTogglingId(id)
    try {
      await adminService.toggleFeatured(id)
      toast({ title: isFeatured ? 'Removed from featured' : 'Added to featured' })
      fetchProducts()
    } catch {
      toast({ title: 'Error', description: 'Could not update featured status.', variant: 'destructive' })
    } finally { setTogglingId(null) }
  }

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Products</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {loading ? '…' : `${total} product${total !== 1 ? 's' : ''} in catalogue`}
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5 text-xs">
          <Link href="/admin/products/create">
            <Plus className="h-3.5 w-3.5" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name or SKU…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 rounded-xl border-border bg-card" />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Product', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Featured', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {[...Array(8)].map((_, j) => (
                        <td key={j} className="px-4 py-3.5"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                : products.length === 0
                  ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No products found</p>
                      </td>
                    </tr>
                  )
                  : products.map(p => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
                            <Package className="h-4 w-4 text-violet-400" />
                          </div>
                          <span className="font-medium text-foreground max-w-45 truncate">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{p.sku}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{p.category?.name ?? '—'}</td>
                      <td className="px-4 py-3.5 font-semibold tabular-nums">
                        ₦{Number(p.price).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`font-medium tabular-nums ${p.stock < 10 ? 'text-rose-500' : 'text-foreground'}`}>
                          {p.stock}
                        </span>
                        {p.stock < 10 && (
                          <span className="ml-1 text-xs text-rose-400">low</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5"><StatusPill status={p.status} /></td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => handleToggleFeatured(p.id, p.is_featured)}
                          disabled={togglingId === p.id}
                          className={`rounded-full p-1 transition-colors ${
                            p.is_featured
                              ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                              : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                          }`}>
                          <Star className={`h-4 w-4 ${p.is_featured ? 'fill-amber-500' : ''}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/products/${p.id}/edit`}>
                            <button className="rounded-lg p-1.5 text-muted-foreground hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                          </Link>
                          <button onClick={() => handleDelete(p.id, p.name)}
                            disabled={deletingId === p.id}
                            className="rounded-lg p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg"
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const p = i + 1
              return (
                <Button key={p} variant={page === p ? 'default' : 'outline'}
                  size="sm" className="h-8 w-8 rounded-lg text-xs"
                  onClick={() => setPage(p)}>{p}</Button>
              )
            })}
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}