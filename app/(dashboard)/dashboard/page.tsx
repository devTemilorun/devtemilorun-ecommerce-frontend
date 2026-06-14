
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth-store'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { Package, DollarSign, ShoppingBag, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Use the correct endpoint - /analytics/user
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await api.get('/analytics/user')
      console.log('API Response:', response.data)
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  // Extract data from response
  const statsData = response?.data || response
  const stats = {
    total_orders: statsData?.total_orders || 0,
    total_spent: statsData?.total_spent || 0,
    avg_order_value: statsData?.avg_order_value || 0,
    pending_orders: statsData?.pending_orders || 0,
    processing_orders: statsData?.processing_orders || 0,
    completed_orders: statsData?.completed_orders || 0,
    recent_orders: statsData?.recent_orders || [],
  }

  console.log('Processed stats:', stats)

  if (!isClient || isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.total_orders,
      icon: ShoppingBag,
      color: 'from-blue-500 to-indigo-500',
      link: '/dashboard/orders',
    },
    {
      title: 'Total Spent',
      value: `₦${stats.total_spent.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      link: '/dashboard/orders',
    },
    {
      title: 'Avg Order Value',
      value: `₦${stats.avg_order_value.toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      link: '/dashboard/orders',
    },
    {
      title: 'Pending Orders',
      value: stats.pending_orders,
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
      link: '/dashboard/orders',
    },
  ]

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending_payment: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      paid: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      processing: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      shipped: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      delivered: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your account today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Link key={index} href={card.link}>
              <Card className="relative overflow-hidden transition-all hover:shadow-xl cursor-pointer group">
                <div className={`absolute right-0 top-0 h-24 w-24 opacity-10 bg-gradient-to-br ${card.color}`} />
                <CardHeader className="relative pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-full bg-gradient-to-br ${card.color} p-2 text-white`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-2xl font-bold">{card.value}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/orders">View All →</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats.recent_orders && stats.recent_orders.length > 0 ? (
            <div className="space-y-4">
              {stats.recent_orders.map((order: any) => (
                <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                  <div className="flex items-center justify-between border-b pb-3 last:border-0 cursor-pointer hover:bg-muted/50 transition-colors p-2 rounded-lg">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₦{parseFloat(order.total).toLocaleString()}</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status?.replace('_', ' ') || order.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <Package className="mb-3 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No orders yet</p>
              <Button className="mt-4" asChild>
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Order Status Updates</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Your order status will be updated in real-time. You'll receive email notifications at each stage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}