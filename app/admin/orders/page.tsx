'use client'

import { useEffect, useState } from 'react'
import { adminService } from '@/services/api/admin.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Package } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

const statusColors: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [page, statusFilter])

  const fetchOrders = async () => {
    try {
      const data = await adminService.getOrders(page, statusFilter)
      setOrders(data.data || [])
      setTotalPages(data.last_page || 1)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await adminService.updateOrderStatus(id, status)
      toast({ title: 'Success', description: 'Order status updated' })
      fetchOrders()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={statusFilter === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('')}
        >
          All
        </Button>
        {Object.keys(statusColors).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-lg">{order.order_number}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()} by {order.user?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[order.status]}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    className="rounded-md border px-2 py-1 text-sm"
                  >
                    <option value="pending_payment">Pending Payment</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">₦{order.total}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.items?.length || 0} items
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/admin/orders/${order.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="py-2 px-4">Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}