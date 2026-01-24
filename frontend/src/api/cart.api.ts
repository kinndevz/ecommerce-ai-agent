import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'
import type {
  AddToCartRequest,
  ApiSuccessResponse,
  CartData,
  CartItem,
  UpdateCartItemRequest,
} from './types/cart.types'

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
} from './types/cart.types'
