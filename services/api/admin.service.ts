import api from '@/lib/axios'

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  stock: number
  status: string
  is_featured: boolean
  category_id: number
  sales_count?: number
  category?: Category
  created_at: string
  updated_at: string
}

export interface OrderAddress {
  first_name: string
  last_name: string
  email: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  is_active: boolean
}


export interface Order {
  id: number
  order_number: string
  status: string
  subtotal: number
  tax: number
  shipping_cost: number
  discount: number
  total: number
  shipping_address: OrderAddress | string | null
  billing_address?: OrderAddress | string | null
  payment_method: string
  paid_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  user: {
    id: number
    name: string
    email: string
  }
  items: Array<{
    id: number
    product_id: number
    product_name: string
    product_sku: string
    unit_price: number
    quantity: number
    total: number
  }>
}



class AdminService {
  // Dashboard Stats
  async getDashboardStats() {
    const response = await api.get('/admin/analytics/dashboard')
    return response.data
  }

  // Products
  async getProducts(page = 1, search = '') {
    const response = await api.get(`/admin/products?page=${page}&search=${search}`)
    return response.data
  }

  async getProduct(id: number) {
    const response = await api.get(`/admin/products/${id}`)
    return response.data
  }

  async createProduct(data: Partial<Product>) {
    const response = await api.post('/admin/products', data)
    return response.data
  }

  async updateProduct(id: number, data: Partial<Product>) {
    const response = await api.put(`/admin/products/${id}`, data)
    return response.data
  }

  async deleteProduct(id: number) {
    const response = await api.delete(`/admin/products/${id}`)
    return response.data
  }

  async toggleFeatured(id: number): Promise<any> {
    const response = await api.patch(`/admin/products/${id}/featured`)
    return response
  }

  // Categories
  async getCategories() {
    const response = await api.get('/admin/categories')
    return response.data
  }

  async createCategory(data: Partial<Category>) {
    const response = await api.post('/admin/categories', data)
    return response.data
  }

  async updateCategory(id: number, data: Partial<Category>) {
    const response = await api.put(`/admin/categories/${id}`, data)
    return response.data
  }

  async deleteCategory(id: number) {
    const response = await api.delete(`/admin/categories/${id}`)
    return response.data
  }

  // Orders
  async getOrders(page = 1, status = '') {
    const response = await api.get(`/admin/orders?page=${page}&status=${status}`)
    return response.data
  }

  async getOrder(id: number): Promise<Order> {
    const response = await api.get<Order>(`/admin/orders/${id}`)
    return response.data
  }

  async updateOrderStatus(id: number, status: string) {
    const response = await api.put(`/admin/orders/${id}/status`, { status })
    return response.data
  }

  // Customers
  async getCustomers(page = 1, search = '') {
    const response = await api.get(`/admin/users?page=${page}&search=${search}`)
    return response.data
  }

  async getCustomer(id: number) {
    const response = await api.get(`/admin/users/${id}`)
    return response.data
  }

  async updateCustomerRole(id: number, role: string) {
    const response = await api.put(`/admin/users/${id}`, { role })
    return response.data
  }

  // Analytics 
  async getRevenueStats() {
    const response = await api.get('/admin/analytics/revenue')
    return response.data
  }

  async getTopProducts() {
    const response = await api.get('/admin/analytics/products')
    return response.data
  }

  async getCustomerStats() {
    const response = await api.get('/admin/analytics/customers')
    return response.data
  }

  // Settings
  async getSettings() {
    const response = await api.get('/admin/settings')
    return response.data
  }

  async updateSettings(data: any) {
    const response = await api.post('/admin/settings', data)
    return response.data
  }
}

export const adminService = new AdminService()