'use client'

import { useEffect, useState } from 'react'
import { adminService } from '@/services/api/admin.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  Calendar,
  Download,
  Filter,
  Clock,
  Activity,
  Eye,
  ShoppingCart,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4']

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('12m')
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const [revenue, products, customers] = await Promise.all([
        adminService.getRevenueStats(),
        adminService.getTopProducts(),
        adminService.getCustomerStats()
      ])
      setAnalytics({ revenue, products, customers })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
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

  // Mock comprehensive analytics data
  const revenueData = [
    { month: 'Jan', revenue: 45000, profit: 13500, customers: 320, avgOrderValue: 140 },
    { month: 'Feb', revenue: 52000, profit: 15600, customers: 380, avgOrderValue: 136 },
    { month: 'Mar', revenue: 48000, profit: 14400, customers: 350, avgOrderValue: 137 },
    { month: 'Apr', revenue: 61000, profit: 18300, customers: 420, avgOrderValue: 145 },
    { month: 'May', revenue: 58000, profit: 17400, customers: 400, avgOrderValue: 145 },
    { month: 'Jun', revenue: 72000, profit: 21600, customers: 480, avgOrderValue: 150 },
    { month: 'Jul', revenue: 68000, profit: 20400, customers: 460, avgOrderValue: 147 },
    { month: 'Aug', revenue: 79000, profit: 23700, customers: 520, avgOrderValue: 152 },
    { month: 'Sep', revenue: 85000, profit: 25500, customers: 560, avgOrderValue: 151 },
    { month: 'Oct', revenue: 92000, profit: 27600, customers: 600, avgOrderValue: 153 },
    { month: 'Nov', revenue: 88000, profit: 26400, customers: 580, avgOrderValue: 151 },
    { month: 'Dec', revenue: 105000, profit: 31500, customers: 680, avgOrderValue: 154 },
  ]

  const deviceData = [
    { name: 'Desktop', value: 45, color: '#0088FE' },
    { name: 'Mobile', value: 40, color: '#00C49F' },
    { name: 'Tablet', value: 15, color: '#FFBB28' },
  ]

  const customerSegmentData = [
    { name: 'New', value: 35, color: '#8884D8' },
    { name: 'Returning', value: 45, color: '#82CA9D' },
    { name: 'Loyal', value: 20, color: '#FF6B6B' },
  ]

  const hourlySales = [
    { hour: '00', sales: 120 },
    { hour: '04', sales: 80 },
    { hour: '08', sales: 350 },
    { hour: '12', sales: 680 },
    { hour: '16', sales: 950 },
    { hour: '20', sales: 780 },
    { hour: '24', sales: 250 },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="mb-2 font-semibold">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="text-sm" style={{ color: p.color }}>
              {p.name}: {p.name.includes('Revenue') ? '₦' : ''}{p.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your store performance and customer insights
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="3m">Last 3 months</option>
            <option value="12m">Last 12 months</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦892,000</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>+18.2% from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦148</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>+5.2% from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Customer Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦1,250</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>+12.3% from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4%</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingDown className="h-3 w-3" />
              <span>-0.5% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue & Profit Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    fill="url(#revenueGradient)"
                    name="Revenue (₦)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="profit"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Profit (₦)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="customerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FF8042" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="customers"
                    stroke="#FF8042"
                    fill="url(#customerGradient)"
                    name="New Customers"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device & Customer Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Segmentation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerSegmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {customerSegmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Sales Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Sales Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sales" fill="#8884d8">
                  {hourlySales.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`hsl(${210 + (entry.sales / 1000) * 100}, 70%, 50%)`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Peak Sales Hour</p>
                <p className="text-2xl font-bold">4 PM - 8 PM</p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">40% of daily sales</p>
              </div>
              <div className="rounded-full bg-blue-200 p-2 dark:bg-blue-800">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-300">Best Day</p>
                <p className="text-2xl font-bold">Friday</p>
                <p className="text-xs text-green-600 dark:text-green-300 mt-1">₦124,000 average</p>
              </div>
              <div className="rounded-full bg-green-200 p-2 dark:bg-green-800">
                <Calendar className="h-4 w-4 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Top Category</p>
                <p className="text-2xl font-bold">Electronics</p>
                <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">35% of sales</p>
              </div>
              <div className="rounded-full bg-purple-200 p-2 dark:bg-purple-800">
                <Package className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}