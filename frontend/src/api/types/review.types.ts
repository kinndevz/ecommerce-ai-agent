// review.types.ts

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  title: string | null
  content: string
  verified_purchase: boolean
  helpful_count: number
  skin_type: string | null
  age_range: string | null
  user_name: string | null
  user_avatar: string | null
  created_at: string
  updated_at: string
}

export interface ProductRatingSummary {
  average_rating: number
  review_count: number
}

export interface CreateReviewRequest {
  rating: number
  content: string
  title?: string | null
  skin_type?: string | null
  age_range?: string | null
}

export interface UpdateReviewRequest {
  rating?: number
  content?: string
  title?: string | null
  skin_type?: string | null
  age_range?: string | null
}

export interface ReviewQueryParams {
  page?: number
  limit?: number
}

export interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T | null
  meta?: Record<string, any> | null
}
