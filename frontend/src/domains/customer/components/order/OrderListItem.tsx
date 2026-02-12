import { Link } from 'react-router-dom'
import { Calendar, ChevronRight, Package } from 'lucide-react'
import { Card } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import type { OrderHistoryItem } from '@/api/types/order.types'
import { OrderStatusBadge } from './OrderStatusBadge'
import { formatCurrencyVnd, formatShortDate } from '../../helpers/formatters'

interface OrderListItemProps {
  order: OrderHistoryItem
}

export function OrderListItem({ order }: OrderListItemProps) {
  return (
    <Card className='group flex flex-col overflow-hidden transition-all hover:shadow-md hover:border-primary/50 sm:flex-row'>
      <div className='relative h-48 w-full shrink-0 overflow-hidden bg-muted/20 sm:h-auto sm:w-48'>
        {order.product_image ? (
          <img
            src={order.product_image}
            alt={order.order_number}
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center'>
            <Package className='h-8 w-8 text-muted-foreground/30' />
          </div>
        )}
      </div>

      <div className='flex flex-1 flex-col justify-between p-5'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-1'>
            <div className='flex items-center gap-3'>
              <h3 className='text-lg font-bold text-primary'>
                #{order.order_number}
              </h3>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Calendar className='h-3.5 w-3.5' />
              <span>{formatShortDate(order.created_at)}</span>
            </div>
          </div>

          <div className='text-left sm:text-right'>
            <p className='text-sm text-muted-foreground'>Tổng thành tiền</p>
            <p className='text-xl font-bold text-primary'>
              {formatCurrencyVnd(order.total)}
            </p>
          </div>
        </div>

        <div className='mt-4 flex items-center justify-between border-t pt-4'>
          <p className='text-sm text-muted-foreground'>
            {order.total_items} sản phẩm •{' '}
            {order.payment_status === 'paid'
              ? 'Đã thanh toán'
              : 'Chưa thanh toán'}
          </p>

          <Button asChild size='sm'>
            <Link to={`/orders/${order.id}`}>
              Chi tiết <ChevronRight className='ml-1 h-4 w-4' />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
