
export interface Product {
  id: number
  name: string
  slug: string
  description: string
  short_description?: string
  price: number
  compare_price?: number
  stock: number
  low_stock_threshold?: number
  sku: string
  category_id: number
  category?: Category
  images: string[] | null
  thumbnail?: string | null
  attributes?: Record<string, any> | null
  weight?: number | null
  status: 'draft' | 'published' | 'archived'
  is_featured: boolean
  views?: number
  sales_count?: number
  rating?: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image?: string
  parent_id?: number
  is_active?: boolean
  children?: Category[]
}

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular'
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}