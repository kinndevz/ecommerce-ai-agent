import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  cartAPI,
  type AddToCartRequest,
  type UpdateCartItemRequest,
} from '@/api/cart.api'
import { toast } from 'sonner'

// QUERY KEYS
export const cartKeys = {
  all: ['cart'] as const,
  details: () => [...cartKeys.all, 'detail'] as const,
}

// QUERY HOOKS

/**
 * Get current user's cart
 */
export function useCart() {
  return useQuery({
    queryKey: cartKeys.details(),
    queryFn: async () => {
      const response = await cartAPI.get()
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch cart')
      }
      return response.data
    },
    staleTime: 0,
  })
}

// MUTATION HOOKS

/**
 * Add item to cart mutation
 */
export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddToCartRequest) => cartAPI.addItem(data),
    onSuccess: () => {
      toast.success('Sản phẩm đã được thêm vào giỏ hàng')
      queryClient.invalidateQueries({ queryKey: cartKeys.details() })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Không thể thêm vào giỏ hàng'
      )
    },
  })
}

/**
 * Update cart item quantity mutation
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string
      data: UpdateCartItemRequest
    }) => cartAPI.updateItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.details() })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Cập nhật số lượng thất bại'
      )
    },
  })
}

/**
 * Remove item from cart mutation
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => cartAPI.removeItem(itemId),
    onSuccess: () => {
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
      queryClient.invalidateQueries({ queryKey: cartKeys.details() })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Xóa sản phẩm thất bại')
    },
  })
}

/**
 * Clear all items from cart mutation
 */
export function useClearCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => cartAPI.clear(),
    onSuccess: () => {
      toast.success('Đã xóa toàn bộ giỏ hàng')
      queryClient.invalidateQueries({ queryKey: cartKeys.details() })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Làm sạch giỏ hàng thất bại'
      )
    },
  })
}
