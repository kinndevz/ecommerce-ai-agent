import {
  ORDER_STATUS,
  ORDER_STATUS_FLOW,
  type OrderStatusType,
} from '@/api/services/order.constants'

export const getOrderProgressValue = (status: OrderStatusType): number => {
  if (status === ORDER_STATUS.CANCELLED) return 100

  const currentIndex = ORDER_STATUS_FLOW.findIndex(
    (step) => step.status === status
  )

  if (currentIndex === -1) return 0

  // Pending (0) -> 25%
  // Processing (1) -> 50%
  // Shipped (2) -> 75%
  // Delivered (3) -> 100%
  const totalSteps = ORDER_STATUS_FLOW.length
  return Math.round(((currentIndex + 1) / totalSteps) * 100)
}

export const getCurrentStepInfo = (status: OrderStatusType) => {
  if (status === ORDER_STATUS.CANCELLED) {
    return {
      description: 'Đơn hàng đã bị hủy',
      isCancelled: true,
    }
  }

  const step = ORDER_STATUS_FLOW.find((s) => s.status === status)

  return {
    description: step?.description || 'Trạng thái đơn hàng',
    icon: step?.icon,
    isCancelled: false,
  }
}
