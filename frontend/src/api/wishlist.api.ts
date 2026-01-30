import api from '@/lib/api'
import type {
  AddWishlistRequest,
  ApiSuccessResponse,
  WishlistItem,
  WishlistQueryParams,
} from './types/wishlist.types'
import { API_ENDPOINT } from './services/constants'

export const wishlistAPI = {
  // Get list of wishlist items
  getList: async (
    params?: WishlistQueryParams
  ): Promise<ApiSuccessResponse<WishlistItem[]>> => {
    const { data } = await api.get<ApiSuccessResponse<WishlistItem[]>>(
      API_ENDPOINT.WISHLIST,
      { params }
    )
    return data
  },

  // Add product to wishlist
  add: async (productId: string): Promise<ApiSuccessResponse<WishlistItem>> => {
    const payload: AddWishlistRequest = { product_id: productId }
    const { data } = await api.post<ApiSuccessResponse<WishlistItem>>(
      API_ENDPOINT.WISHLIST,
      payload
    )
    return data
  },

  // Remove product from wishlist
  remove: async (productId: string): Promise<ApiSuccessResponse<string>> => {
    const { data } = await api.delete<ApiSuccessResponse<string>>(
      API_ENDPOINT.WISHLIST_REMOVE(productId)
    )
    return data
  },
}

export type {
  WishlistItem,
  WishlistQueryParams,
  AddWishlistRequest,
} from './types/wishlist.types'
