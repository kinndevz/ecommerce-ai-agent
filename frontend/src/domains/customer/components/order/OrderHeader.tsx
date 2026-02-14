import { Clock, Printer, HelpCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge'
import { formatShortDate } from '../../helpers/formatters'
import type { OrderDetail } from '@/api/types/order.types'

interface OrderHeaderProps {
  order: OrderDetail
}

export function OrderHeader({ order }: OrderHeaderProps) {
  return (
    <div className='relative'>
      {/* Decorative line */}
      <div className='absolute -left-4 top-0 bottom-0 w-1 bg-linear-to-b from-primary via-primary/50 to-transparent rounded-full' />

      <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4'>
        <div className='space-y-3'>
          <h1 className='text-3xl lg:text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
            Chi tiết đơn hàng
          </h1>

          <div className='flex flex-wrap items-center gap-3'>
            <div className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-sm text-muted-foreground'>
              <Clock className='h-3.5 w-3.5' />
              <span>Đặt ngày {formatShortDate(order.created_at)}</span>
            </div>
            <div className='h-1 w-1 rounded-full bg-border'></div>
            <code className='px-3 py-1.5 rounded-lg bg-primary/10 text-xs font-mono font-semibold text-primary'>
              {order.order_number}
            </code>
          </div>

          <div className='flex items-center gap-2'>
            <PaymentStatusBadge status={order.payment_status} />
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' className='shadow-sm'>
            <Printer className='mr-2 h-3.5 w-3.5' /> In hóa đơn
          </Button>
          <Button variant='outline' size='sm' className='shadow-sm'>
            <HelpCircle className='mr-2 h-3.5 w-3.5' /> Trợ giúp
          </Button>
        </div>
      </div>
    </div>
  )
}
