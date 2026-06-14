import api from '@/lib/axios'
import { Order } from '@/types/order.types'

export interface OrderAddress {
  first_name: string
  last_name: string
  email: string
  phone: string
  address_line1: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface CreateOrderData {
  items: Array<{ product_id: number; quantity: number }>
  address: OrderAddress
}

export interface CreateOrderResponse {
  success: boolean
  order: Order
}

class OrderService {
  async createOrder(data: CreateOrderData): Promise<CreateOrderResponse> {
    const response = await api.post<CreateOrderResponse>('/orders', data)
    return response.data
  }

  async initializePaystackPayment(orderId: number): Promise<{
    success: boolean
    authorization_url?: string
    reference?: string
  }> {
    const response = await api.post('/paystack/initialize', { order_id: orderId })
    return response.data
  }

  async getOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders')
    return response.data
  }

  async getOrder(id: number): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`)
    return response.data
  }
}

export const orderService = new OrderService()