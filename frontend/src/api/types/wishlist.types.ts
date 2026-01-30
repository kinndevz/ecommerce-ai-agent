export interface WishlistItem {
  id: string
  user_id: string
  product_id: string

  product_name: string
  product_slug: string
  product_image: string | null
  price: number
  sale_price: number | null

  created_at: string
  updated_at: string
}

export interface AddWishlistRequest {
  product_id: string
}

export interface WishlistQueryParams {
  page?: number
  limit?: number
}

export interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T | null
  meta?: Record<string, any> | null
}
