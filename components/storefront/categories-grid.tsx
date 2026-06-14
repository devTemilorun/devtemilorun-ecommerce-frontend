"use client"

import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

const categories = [
  { name: 'Electronics', slug: 'electronics', count: 120 },
  { name: 'Clothing', slug: 'clothing', count: 85 },
  { name: 'Books', slug: 'books', count: 200 },
  { name: 'Home', slug: 'home', count: 150 },
]

export function CategoriesGrid() {
  return (
    <section className="py-16">
      <div className="container">
        <h2 className="mb-8 text-3xl font-bold text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.slug} href={`/shop?category=${category.slug}`}>
              <Card className="transition-all hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.count} products
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}