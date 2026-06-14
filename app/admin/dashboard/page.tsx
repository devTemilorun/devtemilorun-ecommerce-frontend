
'use client'

import { useEffect, useState } from 'react'
import { adminService } from '@/services/api/admin.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Activity
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4']

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const dashboardData = await adminService.getDashboardStats()
      setStats(dashboardData)
      
      // Process revenue data for chart
      if (dashboardData?.revenue_by_day) {
        const formattedRevenueData = dashboardData.revenue_by_day.map((item: any) => ({
          month: new Date(item.date).toLocaleString('default', { month: 'short' }),
          revenue: item.revenue,
          orders: item.orders || 0,
          customers: item.customers || 0
        }))
        setRevenueData(formattedRevenueData)
      }
      
      // Process and sort category data (already sorted from backend)
      if (dashboardData?.categories_data && dashboardData.categories_data.length > 0) {
        // Calculate percentages for tooltip
        const total = dashboardData.categories_data.reduce((sum: number, cat: any) => sum + cat.value, 0)
        const categoriesWithPercent = dashboardData.categories_data.map((cat: any) => ({
          ...cat,
          percentage: total > 0 ? ((cat.value / total) * 100).toFixed(1) : 0
        }))
        setCategoryData(categoriesWithPercent)
      }
      
      // Process top products
      if (dashboardData?.top_products) {
        setTopProducts(dashboardData.top_products)
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-pulse rounded-full bg-primary/20" />
          </div>
        </div>
      </div>
    )
  }

  const summaryCards = [
    {
      title: 'Total Revenue',
      value: `₦${stats?.total_revenue?.toLocaleString() || '0'}`,
      icon: DollarSign,
      change: stats?.revenue_growth || '+0%',
      trend: stats?.revenue_growth?.startsWith('+') ? 'up' : 'down',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Total Orders',
      value: stats?.total_orders || '0',
      icon: ShoppingBag,
      change: stats?.orders_growth || '+0%',
      trend: stats?.orders_growth?.startsWith('+') ? 'up' : 'down',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Total Customers',
      value: stats?.total_customers || '0',
      icon: Users,
      change: stats?.customers_growth || '+0%',
      trend: stats?.customers_growth?.startsWith('+') ? 'up' : 'down',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Total Products',
      value: stats?.total_products || '0',
      icon: Package,
      change: stats?.products_growth || '+0%',
      trend: stats?.products_growth?.startsWith('+') ? 'up' : 'down',
      color: 'from-orange-500 to-red-500',
    },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="text-sm" style={{ color: p.color }}>
              {p.name}: {p.name === 'Revenue' ? '₦' : ''}{p.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">Sales: {data.value.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Percentage: {data.percentage}%</p>
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    
    // Only show label if percentage is > 5%
    if (percent < 0.05) return null
    
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon
          const TrendIcon = card.trend === 'up' ? ArrowUpRight : ArrowDownRight
          const trendColor = card.trend === 'up' ? 'text-green-600' : 'text-red-600'
          return (
            <Card key={index} className="relative overflow-hidden transition-all hover:shadow-xl">
              <div className={`absolute right-0 top-0 h-32 w-32 opacity-10 bg-gradient-to-br ${card.color}`} />
              <CardHeader className="relative pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-full bg-gradient-to-br ${card.color} p-2 text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{card.value}</div>
                      <div className="flex items-center gap-1 text-sm">
                        <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                        <span className={trendColor}>{card.change}</span>
                        <span className="text-muted-foreground">vs last month</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend Chart */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue (₦)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No revenue data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution - Now sorted and limited */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing top {categoryData.filter(c => c.name !== 'Others').length} categories {categoryData.some(c => c.name === 'Others') ? '+ Others' : ''}
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry: any) => (
                        <span className="text-sm">
                          {value} ({entry.payload.percentage}%)
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No category data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left font-medium">#</th>
                    <th className="pb-3 text-left font-medium">Product</th>
                    <th className="pb-3 text-right font-medium">Sales</th>
                    <th className="pb-3 text-right font-medium">Revenue</th>
                    <th className="pb-3 text-right font-medium">Stock</th>
                   </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 text-center font-semibold text-muted-foreground">
                        #{index + 1}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <Package className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-semibold">
                        {product.sales_count?.toLocaleString() || '0'}
                      </td>
                      <td className="py-3 text-right font-medium text-primary">
                        ₦{((product.price || 0) * (product.sales_count || 0)).toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock < 10 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' 
                            : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {product.stock} in stock
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">No product data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}