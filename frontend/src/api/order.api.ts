import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'
import type {
  ApiSuccessResponse,
  CreateOrderRequest,
  OrderDetail,
  OrderListItem,
  OrderQueryParams,
  OrderStats,
  UpdateOrderStatusRequest,
} from './types/order.types'

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
   * Get order detail (Admin)
   * GET /orders/admin/{order_id}
   */
  getDetailAdmin: async (
    orderId: string
  ): Promise<ApiSuccessResponse<OrderDetail>> => {
    const { data } = await api.get<ApiSuccessResponse<OrderDetail>>(
      API_ENDPOINT.GET_ORDER_DETAIL_ADMIN(orderId)
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
  ApiSuccessResponse,
} from './types/order.types'
