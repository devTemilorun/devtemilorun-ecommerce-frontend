'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { orderService } from '@/services/api/order.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Package, Truck, CheckCircle, Clock, AlertCircle, Info } from 'lucide-react'

const statusColors: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  shipped: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

const statusSteps = [
  { status: 'pending_payment', label: 'Order Placed', description: 'Your order has been received' },
  { status: 'paid', label: 'Payment Confirmed', description: 'Payment has been verified' },
  { status: 'processing', label: 'Processing', description: 'Your order is being prepared' },
  { status: 'shipped', label: 'Shipped', description: 'Your order is on the way' },
  { status: 'delivered', label: 'Delivered', description: 'Order completed successfully' },
]

export default function UserOrderDetailPage() {
  const params = useParams()
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', params.id],
    queryFn: () => orderService.getOrder(Number(params.id)),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!order) {
    return <div>Order not found</div>
  }

  const currentStepIndex = statusSteps.findIndex(step => step.status === order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Order #{order.order_number}</h1>
          <p className="text-muted-foreground">
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Status Info Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Order Tracking Information</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Your order status will be updated automatically as it progresses. 
                You will receive email notifications at each stage. If you have any questions, 
                please contact our support team.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Timeline */}
      {!isCancelled && (
        <Card>
          <CardHeader>
            <CardTitle>Order Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-6 top-0 h-full w-0.5 bg-muted" />
              <div className="space-y-8">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex
                  const Icon = isCompleted ? CheckCircle : Clock
                  
                  return (
                    <div key={step.status} className="relative flex gap-4">
                      <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${
                        isCompleted 
                          ? 'bg-green-100 dark:bg-green-900' 
                          : 'bg-muted'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          isCompleted 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold ${isCurrent ? 'text-primary' : ''}`}>
                            {step.label}
                          </h4>
                          {isCurrent && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.description}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-primary mt-2">
                            We're working on your order. You'll receive updates shortly.
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancelled Order Message */}
      {isCancelled && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-100">Order Cancelled</h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  This order has been cancelled. If you believe this is an error, please contact support.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ₦{item.unit_price}
                      </p>
                    </div>
                    <p className="font-semibold">₦{item.total}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₦{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>₦{order.shipping_cost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>₦{order.tax}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total</span>
                <span>₦{order.total}</span>
              </div>
            </CardContent>
          </Card>

          {/* Status Badge */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Status</span>
                <Badge className={statusColors[order.status]}>
                  {order.status?.replace('_', ' ')}
                </Badge>
              </div>
              {order.status === 'pending_payment' && (
                <p className="mt-3 text-xs text-muted-foreground">
                  ⚡ Complete your payment to confirm your order
                </p>
              )}
              {order.status === 'paid' && (
                <p className="mt-3 text-xs text-muted-foreground">
                  📦 Payment confirmed! We're preparing your order.
                </p>
              )}
              {order.status === 'processing' && (
                <p className="mt-3 text-xs text-muted-foreground">
                  🔄 Your order is being packed and will be shipped soon.
                </p>
              )}
              {order.status === 'shipped' && (
                <p className="mt-3 text-xs text-muted-foreground">
                  🚚 Your order is on its way! Tracking details will be available soon.
                </p>
              )}
              {order.status === 'delivered' && (
                <p className="mt-3 text-xs text-muted-foreground">
                  ✅ Order completed! Thank you for shopping with us.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shipping_address && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p>{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                  <p>{order.shipping_address.address_line1}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                  <p>{order.shipping_address.postal_code}</p>
                  <p>{order.shipping_address.country}</p>
                  <p className="pt-2">{order.shipping_address.phone}</p>
                  <p>{order.shipping_address.email}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}