import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import {
  reviewAPI,
  type CreateReviewRequest,
  type UpdateReviewRequest,
  type ReviewQueryParams,
} from '@/api/review.api'
import { toast } from 'sonner'

// QUERY KEYS
export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  byProduct: (productId: string, params: ReviewQueryParams) =>
    [...reviewKeys.lists(), productId, params] as const,
  summaries: () => [...reviewKeys.all, 'summary'] as const,
  summary: (productId: string) =>
    [...reviewKeys.summaries(), productId] as const,
}

// QUERY HOOKS

/**
 * Get reviews for a specific product - With Pagination & Sorting
 */
export function useProductReviews(
  productId: string,
  params?: ReviewQueryParams
) {
  return useQuery({
    queryKey: reviewKeys.byProduct(productId, params || {}),
    queryFn: () => reviewAPI.getList(productId, params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30s
    enabled: !!productId,
  })
}

/**
 * Get rating summary (Average stars, total count) for a product
 */
export function useProductRatingSummary(productId: string) {
  return useQuery({
    queryKey: reviewKeys.summary(productId),
    queryFn: () => reviewAPI.getRatingSummary(productId),
    staleTime: 60 * 1000, // 1 minute
    enabled: !!productId,
  })
}

// MUTATION HOOKS

/**
 * Create a new review
 */
export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string
      data: CreateReviewRequest
    }) => reviewAPI.create(productId, data),
    onSuccess: (_, variables) => {
      toast.success('Đánh giá sản phẩm thành công!')
      queryClient.invalidateQueries({
        queryKey: reviewKeys.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: reviewKeys.summary(variables.productId),
      })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          'Không thể gửi đánh giá, vui lòng thử lại'
      )
    },
  })
}

/**
 * Update an existing review
 */
export function useUpdateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string
      data: UpdateReviewRequest
    }) => reviewAPI.update(reviewId, data),
    onSuccess: (response) => {
      toast.success('Cập nhật đánh giá thành công')
      if (response.data?.product_id) {
        queryClient.invalidateQueries({
          queryKey: reviewKeys.summary(response.data.product_id),
        })
      } else {
        queryClient.invalidateQueries({ queryKey: reviewKeys.summaries() })
      }

      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Cập nhật đánh giá thất bại'
      )
    },
  })
}

/**
 * Delete a review
 */
export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reviewId: string) => reviewAPI.delete(reviewId),
    onSuccess: () => {
      toast.success('Đã xóa đánh giá')
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() })
      queryClient.invalidateQueries({ queryKey: reviewKeys.summaries() })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể xóa đánh giá')
    },
  })
}
