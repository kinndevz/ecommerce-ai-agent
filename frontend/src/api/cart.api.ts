import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'

// Request Interfaces
interface AddToCartRequest {
  product_id: string
  variant_id?: string | null
  quantity: number
}

interface UpdateCartItemRequest {
  quantity: number
}

// Response Data Interfaces
interface CartItem {
  id: string
  product_id: string
  variant_id: string | null
  quantity: number
  price: number

  // Product details
  product_name: string
  product_slug: string
  product_image: string | null
  variant_name: string | null

  // Computed
  subtotal: number

  created_at: string
  updated_at: string
}

interface CartData {
  id: string
  user_id: string
  items: CartItem[]

  // Summary
  total_items: number
  subtotal: number

  created_at: string
  updated_at: string
}

// Response Wrappers
interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T | null
  meta?: Record<string, any> | null
}

// CART API METHODS
export const cartAPI = {
  /**
   * Get user's cart
   * GET /cart
   */
  get: async (): Promise<ApiSuccessResponse<CartData>> => {
    const { data } = await api.get<ApiSuccessResponse<CartData>>(
      API_ENDPOINT.GET_CART
    )
    return data
  },

  /**
   * Add item to cart
   * POST /cart/items
   */
  addItem: async (
    itemData: AddToCartRequest
  ): Promise<ApiSuccessResponse<CartData>> => {
    const { data } = await api.post<ApiSuccessResponse<CartData>>(
      API_ENDPOINT.ADD_TO_CART,
      itemData
    )
    return data
  },

  /**
   * Update cart item quantity
   * PUT /cart/items/{item_id}
   */
  updateItem: async (
    itemId: string,
    updateData: UpdateCartItemRequest
  ): Promise<ApiSuccessResponse<CartData>> => {
    const { data } = await api.put<ApiSuccessResponse<CartData>>(
      API_ENDPOINT.UPDATE_CART_ITEM(itemId),
      updateData
    )
    return data
  },

  /**
   * Remove item from cart
   * DELETE /cart/items/{item_id}
   */
  removeItem: async (itemId: string): Promise<ApiSuccessResponse<CartData>> => {
    const { data } = await api.delete<ApiSuccessResponse<CartData>>(
      API_ENDPOINT.REMOVE_CART_ITEM(itemId)
    )
    return data
  },

  /**
   * Clear all items from cart
   * DELETE /cart
   */
  clear: async (): Promise<ApiSuccessResponse<CartData>> => {
    const { data } = await api.delete<ApiSuccessResponse<CartData>>(
      API_ENDPOINT.CLEAR_CART
    )
    return data
  },
}

export type {
  AddToCartRequest,
  UpdateCartItemRequest,
  CartItem,
  CartData,
  ApiSuccessResponse,
}
