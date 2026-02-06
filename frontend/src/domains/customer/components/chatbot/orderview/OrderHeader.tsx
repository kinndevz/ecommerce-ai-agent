import { CalendarDays, Wallet } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from '@/api/services/order.constants'
import type { OrderDetail } from '@/api/order.api'
import { formatShortDate } from '@/domains/customer/helpers/formatters'

interface OrderHeaderProps {
  order: OrderDetail
}

export const OrderHeader = ({ order }: OrderHeaderProps) => {
  const statusStyle =
    ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending || {}
  const paymentStyle =
    PAYMENT_STATUS_CONFIG[order.payment_status] ||
    PAYMENT_STATUS_CONFIG.unpaid ||
    {}

  return (
    <div className='flex flex-wrap items-start justify-between gap-4'>
      <div className='space-y-2'>
        <p className='text-xs uppercase tracking-wide text-muted-foreground'>
          Order created
        </p>
        <p className='text-2xl font-semibold text-foreground'>
          #{order.order_number}
        </p>
        <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
          <span className='flex items-center gap-1'>
            <CalendarDays className='w-3.5 h-3.5' />
            {formatShortDate(order.created_at)}
          </span>
          {order.payment_method && (
            <span className='flex items-center gap-1'>
              <Wallet className='w-3.5 h-3.5' />
              {order.payment_method}
            </span>
          )}
        </div>
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        <Badge variant='outline' className={statusStyle.className}>
          {statusStyle.label || order.status}
        </Badge>
        <Badge variant='outline' className={paymentStyle.className}>
          {paymentStyle.label || order.payment_status}
        </Badge>
      </div>
    </div>
  )
}
