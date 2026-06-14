
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productService } from '@/services/api/product.service'
import { ProductGrid } from '@/components/storefront/product-grid'
import { ProductFilters } from '@/components/storefront/product-filters'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductFilters as ProductFiltersType } from '@/types/product.types'

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'popular'

export default function ShopPage() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Partial<ProductFiltersType>>({})
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', filters, sortBy, search, page],
    queryFn: () => productService.getProducts({ 
      ...filters, 
      sortBy, 
      search,
      page,
      limit: 12
    }),
  })

  const products = data?.data || []
  const totalPages = data?.last_page || 1
  const currentPage = data?.current_page || 1

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Shop All Products</h1>
        <p className="text-muted-foreground">
          Discover our curated collection of premium products
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filters */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <ProductFilters onFilterChange={setFilters} />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Sort Bar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption)
                  setPage(1)
                }}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
              
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <ProductFilters onFilterChange={setFilters} />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading || isFetching ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-center text-muted-foreground">
                    No products found. Try adjusting your filters or search term.
                  </p>
                </div>
              ) : (
                <>
                  <ProductGrid products={products} />
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1 || isFetching}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                setPage(pageNum)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                              disabled={isFetching}
                              className="h-9 w-9 p-0"
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages || isFetching}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}