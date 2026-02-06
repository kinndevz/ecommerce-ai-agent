import { Badge } from '@/shared/components/ui/badge'
import { Progress } from '@/shared/components/ui/progress'
import {
  ORDER_STATUS_CONFIG,
  ORDER_STATUS,
  type OrderStatusType,
} from '@/api/services/order.constants'
import { formatShortDate } from '@/domains/customer/helpers/formatters'
import {
  getCurrentStepInfo,
  getOrderProgressValue,
} from '@/domains/customer/helpers/order'

interface OrderProgressProps {
  status: OrderStatusType
  createdAt: string
}

export const OrderProgress = ({ status, createdAt }: OrderProgressProps) => {
  const statusConfig =
    ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.pending

  const progress = getOrderProgressValue(status)
  const stepInfo = getCurrentStepInfo(status)

  // Ngày dự kiến
  const estimatedDate = new Date(createdAt)
  estimatedDate.setDate(estimatedDate.getDate() + 3)

  const isNegativeState = status === ORDER_STATUS.CANCELLED

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h3 className='text-base font-bold text-foreground'>Order Details</h3>
          <p className='text-xs text-muted-foreground'>
            Estimated delivery: {formatShortDate(estimatedDate.toISOString())}
          </p>
        </div>
        <Badge
          variant='outline'
          className={`${statusConfig.className} px-3 py-1 text-xs font-semibold capitalize`}
        >
          {statusConfig.label}
        </Badge>
      </div>

      <div className='space-y-2'>
        <div className='flex justify-between items-end text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
          <span>{stepInfo.description}</span>
          <span className={isNegativeState ? 'text-destructive font-bold' : ''}>
            {progress}%
          </span>
        </div>

        <Progress
          value={progress}
          className={`h-2 bg-muted transition-all ${
            isNegativeState
              ? '*:data-[slot=progress-indicator]:bg-destructive'
              : ''
          }`}
        />
      </div>
    </div>
  )
}
