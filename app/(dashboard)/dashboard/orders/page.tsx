'use client'

import { useQuery } from '@tanstack/react-query'
import { orderService } from '@/services/api/order.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Eye } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: () => orderService.getOrders(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
          <p className="mt-2 text-muted-foreground">Start shopping to see your orders here.</p>
          <Button asChild className="mt-6">
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">View and track all your orders</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{order.order_number}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={
                    order.status === 'paid' ? 'default' :
                    order.status === 'cancelled' ? 'destructive' : 'secondary'
                  }
                >
                  {order.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">₦{order.total.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.items?.length || 0} items
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/orders/${order.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}