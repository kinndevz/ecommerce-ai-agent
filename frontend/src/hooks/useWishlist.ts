import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { wishlistAPI, type WishlistQueryParams } from '@/api/wishlist.api'
import { toast } from 'sonner'

// QUERY KEYS
export const wishlistKeys = {
  all: ['wishlist'] as const,
  lists: () => [...wishlistKeys.all, 'list'] as const,
  list: (params: WishlistQueryParams) =>
    [...wishlistKeys.lists(), params] as const,
}

/**
 * Get current user's wishlist
 */
export function useWishlist(params?: WishlistQueryParams) {
  return useQuery({
    queryKey: wishlistKeys.list(params || {}),
    queryFn: () => wishlistAPI.getList(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Add a product to wishlist
 */
export function useAddToWishlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) => wishlistAPI.add(productId),
    onSuccess: () => {
      toast.success('Đã thêm vào danh sách yêu thích')
      queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          'Không thể thêm vào danh sách yêu thích'
      )
    },
  })
}

/**
 * Remove a product from wishlist
 */
export function useRemoveFromWishlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) => wishlistAPI.remove(productId),
    onSuccess: () => {
      toast.success('Đã xóa khỏi danh sách yêu thích')
      queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          'Không thể xóa khỏi danh sách yêu thích'
      )
    },
  })
}

export function useToggleWishlist() {
  const { mutate: add, isPending: isAdding } = useAddToWishlist()
  const { mutate: remove, isPending: isRemoving } = useRemoveFromWishlist()

  const toggle = (productId: string, isCurrentlyLiked: boolean) => {
    if (isCurrentlyLiked) {
      remove(productId)
    } else {
      add(productId)
    }
  }

  return {
    toggle,
    isPending: isAdding || isRemoving,
  }
}
