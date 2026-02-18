import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentAPI } from '@/api/payment.api'
import type { CreatePaymentRequest } from '@/api/types/payment.types'
import { toast } from 'sonner'

export const paymentKeys = {
  all: ['payments'] as const,
  return: (params: string) => [...paymentKeys.all, 'return', params] as const,
  ipn: (params: string) => [...paymentKeys.all, 'ipn', params] as const,
}

// QUERY HOOKS

/**
 * Verify payment return URL (Customer)
 */
export function useVerifyPayment(searchParams: URLSearchParams) {
  const queryString = searchParams.toString()

  return useQuery({
    queryKey: paymentKeys.return(queryString),
    queryFn: async () => {
      const response = await paymentAPI.returnUrl(searchParams)
      if (!response.success) {
        throw new Error(response.message || 'Xác thực thanh toán thất bại')
      }
      return response.data
    },
    enabled: queryString.length > 0,
    retry: false,
    staleTime: 0,
  })
}

// MUTATION HOOKS

/**
 * Create payment URL mutation (Customer)
 */
export function useCreatePayment() {
  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => paymentAPI.pay(data),
    onSuccess: (response) => {
      toast.success('Đang chuyển hướng đến cổng thanh toán...')

      if (response.data?.payment_url) {
        window.location.href = response.data.payment_url
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Không thể tạo giao dịch thanh toán'
      )
    },
  })
}

/**
 * Trigger IPN manually
 */
export function useTriggerIPN() {
  return useMutation({
    mutationFn: (searchParams: URLSearchParams) => paymentAPI.ipn(searchParams),
    onSuccess: () => {
      toast.success('IPN Triggered successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'IPN Trigger failed')
    },
  })
}
