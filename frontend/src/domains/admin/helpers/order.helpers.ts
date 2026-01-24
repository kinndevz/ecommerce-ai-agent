import {
  ORDER_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
  PAYMENT_STATUS_CONFIG,
  ORDER_STATUS,
} from '@/api/services/order.constants'
import type {
  OrderStatusType,
  PaymentMethodType,
  PaymentStatusType,
} from '@/api/services/order.constants'
import type { LucideIcon } from 'lucide-react'
import { CheckCircle, Clock, Package, Truck } from 'lucide-react'

export interface OrderStatusTab {
  value: OrderStatusType | 'all'
  label: string
  count: number
  color: string
  bgColor: string
}

export interface OrderStatusStep {
  status: OrderStatusType
  label: string
  icon: LucideIcon
  description: string
}

export const formatVndCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)

export const formatOrderDate = (value: string) =>
  new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

export const formatOrderTime = (value: string) =>
  new Date(value).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })

export const formatOrderDateTime = (value: string) =>
  new Date(value).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export const getOrderStatusBadgeClass = (status: OrderStatusType) =>
  ORDER_STATUS_CONFIG[status]?.className || ''

export const getPaymentStatusBadgeClass = (status: PaymentStatusType) =>
  PAYMENT_STATUS_CONFIG[status]?.className || ''

export const getPaymentMethodBadgeClass = (method?: PaymentMethodType | null) =>
  method ? PAYMENT_METHOD_CONFIG[method]?.className || '' : ''

export const ORDER_STATUS_FLOW: OrderStatusStep[] = [
  {
    status: ORDER_STATUS.PENDING,
    label: 'Pending',
    icon: Clock,
    description: 'Awaiting confirmation',
  },
  {
    status: ORDER_STATUS.PROCESSING,
    label: 'Processing',
    icon: Package,
    description: 'Being prepared',
  },
  {
    status: ORDER_STATUS.SHIPPED,
    label: 'Shipped',
    icon: Truck,
    description: 'On delivery',
  },
  {
    status: ORDER_STATUS.DELIVERED,
    label: 'Delivered',
    icon: CheckCircle,
    description: 'Completed',
  },
]

export const getOrderStatusIndex = (
  steps: OrderStatusStep[],
  status?: OrderStatusType | null
) => (status ? steps.findIndex((step) => step.status === status) : -1)

export const getOrderStatusTabs = (
  statusCounts?: Record<string, number>
): OrderStatusTab[] => [
  {
    value: 'all',
    label: 'All orders',
    count: statusCounts?.total || 0,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  {
    value: ORDER_STATUS.PENDING,
    label: 'Pending',
    count: statusCounts?.pending || 0,
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
  },
  {
    value: ORDER_STATUS.PROCESSING,
    label: 'Processing',
    count: statusCounts?.processing || 0,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
  },
  {
    value: ORDER_STATUS.SHIPPED,
    label: 'Shipped',
    count: statusCounts?.shipped || 0,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-500/10',
  },
  {
    value: ORDER_STATUS.DELIVERED,
    label: 'Delivered',
    count: statusCounts?.delivered || 0,
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
  },
  {
    value: ORDER_STATUS.CANCELLED,
    label: 'Cancelled',
    count: statusCounts?.cancelled || 0,
    color: 'text-red-600',
    bgColor: 'bg-red-500/10',
  },
]
