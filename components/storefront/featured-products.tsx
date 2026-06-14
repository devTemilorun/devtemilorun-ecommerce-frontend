'use client'

import { useQuery } from '@tanstack/react-query'
import { productService } from '@/services/api/product.service'
import { ProductCard } from './product-card'

export function FeaturedProducts() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productService.getFeatured(),
  })

  if (isLoading) {
    return (
      <section className="py-24">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">Featured Products</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-64 w-full animate-pulse rounded-lg bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    console.error('Failed to load products:', error)
    return (
      <section className="py-24">
        <div className="container text-center">
          <p className="text-red-500">Failed to load products. Please try again later.</p>
        </div>
      </section>
    )
  }

  if (!products || products.length === 0) {
    return (
      <section className="py-24">
        <div className="container text-center">
          <p className="text-muted-foreground">No products found.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24">
      <div className="container"> 
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <p className="mt-2 text-muted-foreground">Hand-picked just for you</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}