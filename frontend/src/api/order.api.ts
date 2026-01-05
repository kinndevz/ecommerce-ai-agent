import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'
import type {
  OrderStatusType,
  PaymentMethodType,
  PaymentStatusType,
} from './services/order.constants'

interface ShippingAddress {
  name: string
  phone: string
  address: string
  city: string
  district?: string | null
  ward?: string | null
  country: string
}

interface OrderItem {
  id: string
  product_id: string
  variant_id?: string | null
  product_name: string
  variant_name?: string | null
  quantity: number
  unit_price: number
  subtotal: number
}

interface OrderDetail {
  id: string
  order_number: string
  user_id: string

  status: OrderStatusType
  payment_status: PaymentStatusType
  payment_method: PaymentMethodType | null

  // Pricing
  subtotal: number
  discount: number
  shipping_fee: number
  total: number

  // Shipping
  shipping_address: ShippingAddress
  notes: string | null

  // Items
  items: OrderItem[]

  // Timestamps
  created_at: string
  updated_at: string
}

interface OrderListItem {
  id: string
  order_number: string
  status: OrderStatusType
  payment_status: PaymentStatusType
  total: number
  total_items: number
  created_at: string
}

interface OrderStats {
  total_orders: number
  pending_orders: number
  processing_orders: number
  shipped_orders: number
  delivered_orders: number
  cancelled_orders: number
  total_revenue: number
}

// REQUEST INTERFACES

interface CreateOrderRequest {
  shipping_address: ShippingAddress
  payment_method: PaymentMethodType
  notes?: string | null
}

interface UpdateOrderStatusRequest {
  status: OrderStatusType
}

interface OrderQueryParams {
  page?: number
  limit?: number
  status?: OrderStatusType
}

// Response Wrappers
interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T | null
  meta?: Record<string, any> | null
}

// API METHODS

export const orderAPI = {
  /**
   * Create order from cart (Customer)
   * POST /orders
   */
  create: async (
    orderData: CreateOrderRequest
  ): Promise<ApiSuccessResponse<OrderDetail>> => {
    const { data } = await api.post<ApiSuccessResponse<OrderDetail>>(
      API_ENDPOINT.CREATE_ORDER,
      orderData
    )
    return data
  },

  /**
   * Get my orders (Customer)
   * GET /orders?page=1&limit=20
   */
  getMyOrders: async (
    params?: OrderQueryParams
  ): Promise<ApiSuccessResponse<OrderListItem[]>> => {
    const { data } = await api.get<ApiSuccessResponse<OrderListItem[]>>(
      API_ENDPOINT.GET_MY_ORDERS,
      { params }
    )
    return data
  },

  /**
   * Get all orders (Admin)
   * GET /orders/all?status=...&page=...
   */
  getAllAdmin: async (
    params?: OrderQueryParams
  ): Promise<ApiSuccessResponse<OrderListItem[]>> => {
    const { data } = await api.get<ApiSuccessResponse<OrderListItem[]>>(
      API_ENDPOINT.GET_ALL_ORDERS_ADMIN,
      { params }
    )
    return data
  },

  /**
   * Get order statistics (Admin)
   * GET /orders/stats
   */
  getStats: async (): Promise<ApiSuccessResponse<OrderStats>> => {
    const { data } = await api.get<ApiSuccessResponse<OrderStats>>(
      API_ENDPOINT.GET_ORDER_STATS
    )
    return data
  },

  /**
   * Get order detail
   * GET /orders/{order_id}
   */
  getDetail: async (
    orderId: string
  ): Promise<ApiSuccessResponse<OrderDetail>> => {
    const { data } = await api.get<ApiSuccessResponse<OrderDetail>>(
      API_ENDPOINT.GET_ORDER_DETAIL(orderId)
    )
    return data
  },

  /**
   * Cancel order (Customer)
   * PATCH /orders/{order_id}/cancel
   */
  cancel: async (orderId: string): Promise<ApiSuccessResponse<OrderDetail>> => {
    const { data } = await api.patch<ApiSuccessResponse<OrderDetail>>(
      API_ENDPOINT.CANCEL_ORDER(orderId)
    )
    return data
  },

  /**
   * Update order status (Admin)
   * PATCH /orders/{order_id}/status
   */
  updateStatus: async (
    orderId: string,
    statusData: UpdateOrderStatusRequest
  ): Promise<ApiSuccessResponse<OrderDetail>> => {
    const { data } = await api.patch<ApiSuccessResponse<OrderDetail>>(
      API_ENDPOINT.UPDATE_ORDER_STATUS(orderId),
      statusData
    )
    return data
  },
}

export type {
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderQueryParams,
  ShippingAddress,
  OrderItem,
  OrderDetail,
  OrderListItem,
  OrderStats,
}
