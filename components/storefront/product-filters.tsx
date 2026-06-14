'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ProductFilters as ProductFiltersType } from '@/types/product.types'

interface ProductFiltersProps {
  onFilterChange: (filters: Partial<ProductFiltersType>) => void
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [category, setCategory] = useState('')

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value)
    onFilterChange({ minPrice: value[0], maxPrice: value[1] })
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value)
    onFilterChange({ category: e.target.value })
  }

  const handleReset = () => {
    setPriceRange([0, 1000])
    setCategory('')
    onFilterChange({})
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-semibold">Categories</h3>
        <select
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={category}
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="books">Books</option>
          <option value="home">Home & Garden</option>
        </select>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Price Range</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            min={0}
            max={1000}
            step={10}
          />
          <div className="flex justify-between text-sm">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={handleReset}>
        Reset Filters
      </Button>
    </div>
  )
}