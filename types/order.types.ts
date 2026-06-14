export type OrderStatus = 
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  product_sku: string
  unit_price: number
  quantity: number
  total: number
}

export interface ShippingAddress {
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

export interface Order {
  id: number
  order_number: string
  user_id: number
  status: OrderStatus
  subtotal: number
  tax: number
  shipping_cost: number
  discount: number
  total: number
  shipping_address: ShippingAddress
  billing_address?: ShippingAddress | null
  payment_method: string
  payment_intent_id?: string
  paid_at?: string
  shipped_at?: string
  delivered_at?: string
  notes?: string
  items?: OrderItem[]
  created_at: string
  updated_at: string
}