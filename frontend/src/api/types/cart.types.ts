export interface AddToCartRequest {
  product_id: string
  variant_id?: string | null
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export interface CartItem {
  id: string
  product_id: string
  variant_id: string | null
  quantity: number
  price: number
  product_name: string
  product_slug: string
  product_image: string | null
  variant_name: string | null
  subtotal: number
  created_at: string
  updated_at: string
}

export interface CartData {
  id: string
  user_id: string
  items: CartItem[]
  total_items: number
  subtotal: number
  created_at: string
  updated_at: string
}

export interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T | null
  meta?: Record<string, any> | null
}
