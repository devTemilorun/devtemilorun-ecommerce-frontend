"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { productService } from '@/services/api/product.service'
import { Skeleton } from '@/components/ui/skeleton'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  products_count?: number
}

export function CategoriesGrid() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await productService.getCategoriesWithCounts()
        setCategories(Array.isArray(response) ? response : [])
      } catch (err) {
        console.error('Failed to fetch categories:', err)
        setError('Failed to load categories')
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Loading state with skeletons
  if (loading) {
    return (
      <section className="py-16">
        <div className="container">
          <h2 className="mb-8 text-3xl font-bold text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="transition-all hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <Skeleton className="h-6 w-24 mx-auto mb-2" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className="py-16">
        <div className="container">
          <h2 className="mb-8 text-3xl font-bold text-center">Shop by Category</h2>
          <div className="text-center text-muted-foreground">
            <p>Failed to load categories. Please try again later.</p>
          </div>
        </div>
      </section>
    )
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <section className="py-16">
        <div className="container">
          <h2 className="mb-8 text-3xl font-bold text-center">Shop by Category</h2>
          <div className="text-center text-muted-foreground">
            <p>No categories available.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="container">
        <h2 className="mb-8 text-3xl font-bold text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/shop?category=${category.slug}`}
              className="transition-all hover:scale-105"
            >
              <Card className="transition-all hover:shadow-lg hover:border-primary/50">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-foreground">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.products_count ?? 0} products
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