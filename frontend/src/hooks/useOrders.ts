import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import {
  orderAPI,
  type CreateOrderRequest,
  type UpdateOrderStatusRequest,
  type OrderQueryParams,
} from '@/api/order.api'
import { cartKeys } from './useCarts'
import { toast } from 'sonner'

//  QUERY KEYS
export const orderKeys = {
  all: ['orders'] as const,
  mine: () => [...orderKeys.all, 'mine'] as const,
  myList: (params: OrderQueryParams) => [...orderKeys.mine(), params] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderQueryParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  stats: () => [...orderKeys.all, 'stats'] as const,
}

//  QUERY HOOKS
/**
 * Get my orders (Customer) - With Pagination
 */
export function useMyOrders(params?: OrderQueryParams) {
  return useQuery({
    queryKey: orderKeys.myList(params || {}),
    queryFn: () => orderAPI.getMyOrders(params),
    placeholderData: keepPreviousData,
    staleTime: 10 * 1000, // 10s
  })
}

/**
 * Get all orders (Admin) - With Pagination & Filters
 */
export function useAdminOrders(params?: OrderQueryParams) {
  return useQuery({
    queryKey: orderKeys.list(params || {}),
    queryFn: () => orderAPI.getAllAdmin(params),
    placeholderData: keepPreviousData,
    staleTime: 10 * 1000,
  })
}

/**
 * Get order detail (Customer & Admin)
 */
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: async () => {
      const response = await orderAPI.getDetail(orderId)
      if (!response.success) {
        throw new Error(response.message || 'Không thể lấy thông tin đơn hàng')
      }
      return response.data
    },
    enabled: !!orderId,
  })
}

/**
 * Get order detail (Admin)
 */
export function useAdminOrder(orderId: string) {
  return useQuery({
    queryKey: [...orderKeys.detail(orderId), 'admin'],
    queryFn: async () => {
      const response = await orderAPI.getDetailAdmin(orderId)
      if (!response.success) {
        throw new Error(response.message || 'Không thể lấy thông tin đơn hàng')
      }
      return response.data
    },
    enabled: !!orderId,
  })
}

/**
 * Get order statistics (Admin)
 */
export function useOrderStats() {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: async () => {
      const response = await orderAPI.getStats()
      if (!response.success) throw new Error(response.message)
      return response.data
    },
    staleTime: 60 * 1000, // 1 phút
  })
}

//  MUTATION HOOKS

/**
 * Create order (Customer)
 * Important: This also clears the cart cache
 */
export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => orderAPI.create(data),
    onSuccess: () => {
      toast.success('Đặt hàng thành công!')
      queryClient.invalidateQueries({ queryKey: orderKeys.mine() })
      queryClient.invalidateQueries({ queryKey: cartKeys.details() })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Đặt hàng thất bại, vui lòng thử lại'
      )
    },
  })
}

/**
 * Cancel order (Customer)
 */
export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) => orderAPI.cancel(orderId),
    onSuccess: (_, orderId) => {
      toast.success('Đã hủy đơn hàng thành công')
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) })
      queryClient.invalidateQueries({ queryKey: orderKeys.mine() })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể hủy đơn hàng')
    },
  })
}

/**
 * Update order status (Admin)
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string
      data: UpdateOrderStatusRequest
    }) => orderAPI.updateStatus(orderId, data),

    onSuccess: (_, variables) => {
      toast.success(`Đã cập nhật trạng thái đơn hàng`)
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.orderId),
      })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Cập nhật trạng thái thất bại'
      )
    },
  })
}
