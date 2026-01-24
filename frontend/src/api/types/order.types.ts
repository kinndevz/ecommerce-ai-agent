import type {
  OrderStatusType,
  PaymentMethodType,
  PaymentStatusType,
} from '../services/order.constants'

export interface ShippingAddress {
  name: string
  phone: string
  address: string
  city: string
  district?: string | null
  ward?: string | null
  country: string
}

export interface OrderItem {
  id: string
  product_id: string
  variant_id?: string | null
  product_name: string
  variant_name?: string | null
  quantity: number
  unit_price: number
  subtotal: number
}

export interface OrderDetail {
  id: string
  order_number: string
  user_id: string
  status: OrderStatusType
  payment_status: PaymentStatusType
  payment_method: PaymentMethodType | null
  subtotal: number
  discount: number
  shipping_fee: number
  total: number
  shipping_address: ShippingAddress
  notes: string | null
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderListItem {
  id: string
  order_number: string
  status: OrderStatusType
  payment_status: PaymentStatusType
  total: number
  total_items: number
  created_at: string
}

export interface OrderStats {
  total_orders: number
  pending_orders: number
  processing_orders: number
  shipped_orders: number
  delivered_orders: number
  cancelled_orders: number
  total_revenue: number
}

export interface CreateOrderRequest {
  shipping_address: ShippingAddress
  payment_method: PaymentMethodType
  notes?: string | null
}

export interface UpdateOrderStatusRequest {
  status: OrderStatusType
}

export interface OrderQueryParams {
  page?: number
  limit?: number
  status?: OrderStatusType
}

export interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T | null
  meta?: Record<string, any> | null
}
