import api from '@/lib/api'
import type {
  ApiSuccessResponse,
  CreatePaymentRequest,
  PaymentReturnData,
  PaymentURLData,
} from './types/payment.types'
import { API_ENDPOINT } from './services/constants'

export const paymentAPI = {
  pay: async (
    payload: CreatePaymentRequest
  ): Promise<ApiSuccessResponse<PaymentURLData>> => {
    const { data } = await api.post<ApiSuccessResponse<PaymentURLData>>(
      API_ENDPOINT.PAY,
      payload
    )
    return data
  },

  returnUrl: async (): Promise<ApiSuccessResponse<PaymentReturnData>> => {
    const { data } = await api.get<ApiSuccessResponse<PaymentReturnData>>(
      API_ENDPOINT.RETURN_URL
    )
    return data
  },
}
