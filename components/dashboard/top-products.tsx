"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const products = [
  { name: 'Product A', sales: 1234, revenue: '$12,345' },
  { name: 'Product B', sales: 987, revenue: '$9,870' },
  { name: 'Product C', sales: 756, revenue: '$7,560' },
]

export function TopProducts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.name} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.sales} sales</p>
              </div>
              <p className="font-semibold">{product.revenue}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}