import api from '@/lib/api'
import type {
  ApiSuccessResponse,
  CreateReviewRequest,
  ProductRatingSummary,
  Review,
  ReviewQueryParams,
  UpdateReviewRequest,
} from './types/review.types'
import { API_ENDPOINT } from './services/constants'

export const reviewAPI = {
  create: async (
    product_id: string,
    reviewData: CreateReviewRequest
  ): Promise<ApiSuccessResponse<Review>> => {
    const { data } = await api.post<ApiSuccessResponse<Review>>(
      API_ENDPOINT.CREATE_REVIEW(product_id),
      reviewData
    )
    return data
  },

  getList: async (
    product_id: string,
    params?: ReviewQueryParams
  ): Promise<ApiSuccessResponse<Review[]>> => {
    const { data } = await api.get<ApiSuccessResponse<Review[]>>(
      API_ENDPOINT.GET_ALL_PRODCT_REVIEWS(product_id),
      { params }
    )
    return data
  },

  getRatingSummary: async (
    product_id: string
  ): Promise<ApiSuccessResponse<ProductRatingSummary>> => {
    const { data } = await api.get<ApiSuccessResponse<ProductRatingSummary>>(
      API_ENDPOINT.GET_RATING_SUMMARY(product_id)
    )
    return data
  },

  update: async (
    review_id: string,
    reviewData: UpdateReviewRequest
  ): Promise<ApiSuccessResponse<Review>> => {
    const { data } = await api.put<ApiSuccessResponse<Review>>(
      API_ENDPOINT.UPDATE_REVIEW(review_id),
      reviewData
    )
    return data
  },

  delete: async (review_id: string): Promise<ApiSuccessResponse<null>> => {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      API_ENDPOINT.DELETE_REVIEW(review_id)
    )
    return data
  },
}

export type {
  CreateReviewRequest,
  ProductRatingSummary,
  Review,
  ReviewQueryParams,
  UpdateReviewRequest,
  ApiSuccessResponse,
} from './types/review.types'
