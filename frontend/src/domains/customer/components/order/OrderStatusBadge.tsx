import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  type OrderStatusType,
  type PaymentStatusType,
} from '@/api/services/order.constants'

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatusType
  className?: string
}) {
  const config = ORDER_STATUS_CONFIG[status]

  if (!config) return null

  return (
    <Badge
      variant='outline'
      className={cn(
        'font-medium border px-2.5 py-0.5 rounded-full',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatusType
  className?: string
}) {
  const config = PAYMENT_STATUS_CONFIG[status]

  if (!config) return null

  return (
    <Badge
      variant='outline'
      className={cn(
        'font-medium border px-2.5 py-0.5 rounded-full',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
