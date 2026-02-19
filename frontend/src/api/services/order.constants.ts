import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react'

// 1. PAYMENT METHOD CONSTANTS
export const PAYMENT_METHOD = {
  COD: 'cod',
  BANK_TRANSFER: 'bank_transfer',
  VNPAY: 'vnpay',
  MOMO: 'momo',
  CREDIT_CARD: 'credit_card',
} as const

export type PaymentMethodType =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]

export const PAYMENT_METHOD_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  [PAYMENT_METHOD.COD]: {
    label: 'Thanh toán khi nhận hàng (COD)',
    className: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  },
  [PAYMENT_METHOD.BANK_TRANSFER]: {
    label: 'Chuyển khoản ngân hàng',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  [PAYMENT_METHOD.VNPAY]: {
    label: 'VNPay',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  [PAYMENT_METHOD.MOMO]: {
    label: 'Ví MoMo',
    className: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  },
  [PAYMENT_METHOD.CREDIT_CARD]: {
    label: 'Thẻ tín dụng',
    className: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  },
}

// 2. ORDER STATUS CONSTANTS
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export type OrderStatusType = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const ORDER_STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  [ORDER_STATUS.PENDING]: {
    label: 'Chờ xác nhận',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
  [ORDER_STATUS.PROCESSING]: {
    label: 'Đang xử lý',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  [ORDER_STATUS.SHIPPED]: {
    label: 'Đang vận chuyển',
    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
  [ORDER_STATUS.DELIVERED]: {
    label: 'Đã giao hàng',
    className: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  [ORDER_STATUS.CANCELLED]: {
    label: 'Đã hủy',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
}

export interface OrderStatusStep {
  status: OrderStatusType
  label: string
  icon: LucideIcon
  description: string
}

export const ORDER_STATUS_FLOW: OrderStatusStep[] = [
  {
    status: ORDER_STATUS.PENDING,
    label: 'Chờ xác nhận',
    icon: Clock,
    description: 'Đơn hàng đang chờ xác nhận',
  },
  {
    status: ORDER_STATUS.PROCESSING,
    label: 'Đang xử lý',
    icon: Package,
    description: 'Người bán đang chuẩn bị hàng',
  },
  {
    status: ORDER_STATUS.SHIPPED,
    label: 'Đang vận chuyển',
    icon: Truck,
    description: 'Đơn hàng đang trên đường giao đến bạn',
  },
  {
    status: ORDER_STATUS.DELIVERED,
    label: 'Hoàn thành',
    icon: CheckCircle,
    description: 'Giao hàng thành công',
  },
]

// 3. PAYMENT STATUS CONSTANTS
export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
} as const

export type PaymentStatusType =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

export const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  [PAYMENT_STATUS.UNPAID]: {
    label: 'Chưa thanh toán',
    className: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  },
  [PAYMENT_STATUS.PAID]: {
    label: 'Đã thanh toán',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  [PAYMENT_STATUS.REFUNDED]: {
    label: 'Đã hoàn tiền',
    className: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  },
  [PAYMENT_STATUS.FAILED]: {
    label: 'Thanh toán thất bại',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
}

export const ERROR_MESSAGES: Record<string, string> = {
  '07': 'Giao dịch bị nghi ngờ gian lận',
  '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking',
  '10': 'Xác thực thông tin không đúng quá số lần quy định',
  '11': 'Đã hết hạn chờ thanh toán',
  '12': 'Thẻ/Tài khoản bị khóa',
  '13': 'Mật khẩu xác thực không đúng',
  '24': 'Giao dịch bị hủy',
  '51': 'Tài khoản không đủ số dư',
  '65': 'Tài khoản đã vượt quá hạn mức giao dịch',
  '75': 'Ngân hàng thanh toán đang bảo trì',
  '79': 'Giao dịch vượt quá số lần thanh toán',
  '99': 'Lỗi không xác định',
}
