export interface CreatePaymentRequest {
  order_id: string
  bank_code?: string | null
  language?: 'vn' | 'en'
}

export interface PaymentURLData {
  payment_url: string
}

export interface PaymentReturnData {
  order_id: string
  order_number: string
  amount: number
  response_code: string
  transaction_no: string
  bank_code: string
}

export interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T
}
