import api from '@/lib/axios'
import { Product, PaginatedResponse, ProductFilters } from '@/types/product.types'

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  products_count?: number
}

class ProductService {
  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams()
    
    if (filters?.category) params.append('category', filters.category)
    if (filters?.minPrice) params.append('min_price', filters.minPrice.toString())
    if (filters?.maxPrice) params.append('max_price', filters.maxPrice.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.sortBy) params.append('sort', filters.sortBy)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('per_page', filters.limit.toString())
    
    const response = await api.get(`/products?${params}`)
    return response.data
  }

  async getProduct(id: number): Promise<Product> {
    const response = await api.get(`/products/${id}`)
    return response.data
  }

  async getFeatured(): Promise<Product[]> {
    const response = await api.get('/products/featured')
    console.log('Featured API Response:', response.data)
    
    if (response.data && response.data.data) {
      return response.data.data
    }
    return response.data
  }

  // ✅ Get categories with product counts
  async getCategoriesWithCounts(): Promise<Category[]> {
    const response = await api.get('/categories')
    console.log('Categories API Response:', response.data)
    
    // Handle different response formats
    const data = response.data
    
    // If response has data property (Laravel format)
    if (data?.data && Array.isArray(data.data)) {
      return data.data
    }
    
    // If response is directly an array
    if (Array.isArray(data)) {
      return data
    }
    
    // If response has categories property
    if (data?.categories && Array.isArray(data.categories)) {
      return data.categories
    }
    
    return []
  }

  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories')
    return response.data
  }

  async searchProducts(query: string): Promise<Product[]> {
    const response = await api.get(`/products?search=${query}`)
    return response.data.data || response.data
  }
}

export const productService = new ProductService()