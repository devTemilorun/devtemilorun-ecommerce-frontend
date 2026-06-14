import api from '@/lib/axios'
import { Product, PaginatedResponse, ProductFilters } from '@/types/product.types'

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
    
    // Laravel pagination returns { data: [], current_page, last_page, per_page, total }
    return response.data
  }

  async getProduct(id: number): Promise<Product> {
    const response = await api.get(`/products/${id}`)
    return response.data
  }

  async getFeatured(): Promise<Product[]> {
    const response = await api.get('/products/featured')
    // The API returns { data: [...], success: true }
    if (response.data && response.data.data) {
      return response.data.data
    }
    return response.data
  }

  async getCategories(): Promise<string[]> {
    const response = await api.get('/categories')
    return response.data
  }

  async searchProducts(query: string): Promise<Product[]> {
    const response = await api.get(`/products?search=${query}`)
    return response.data.data || response.data
  }
}

export const productService = new ProductService()