import { Link } from 'react-router-dom'
import { Calendar, Package } from 'lucide-react'
import { Card } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import type { OrderHistoryItem } from '@/api/types/order.types'
import { OrderStatusBadge } from './OrderStatusBadge'
import { formatCurrencyVnd, formatShortDate } from '../../helpers/formatters'

interface OrderGridItemProps {
  order: OrderHistoryItem
}

export function OrderGridItem({ order }: OrderGridItemProps) {
  return (
    <Card className='group relative flex flex-col overflow-hidden border transition-all hover:shadow-lg hover:border-primary/50'>
      <div className='relative aspect-4/3 w-full overflow-hidden bg-muted/20'>
        {order.product_image ? (
          <img
            src={order.product_image}
            alt={`Order ${order.order_number}`}
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center text-muted-foreground'>
            <Package className='h-10 w-10 opacity-20' />
          </div>
        )}

        <div className='absolute right-2 top-2 z-10'>
          <OrderStatusBadge
            status={order.status}
            className='bg-background/90 shadow-sm backdrop-blur-md'
          />
        </div>
      </div>

      <div className='flex flex-1 flex-col p-4'>
        <div className='mb-3 flex items-start justify-between'>
          <div>
            <h3 className='font-semibold hover:underline'>
              <Link to={`/orders/${order.id}`}>#{order.order_number}</Link>
            </h3>
            <div className='mt-1 flex items-center gap-1.5 text-xs text-muted-foreground'>
              <Calendar className='h-3 w-3' />
              <span>{formatShortDate(order.created_at)}</span>
            </div>
          </div>
        </div>

        <div className='mt-auto space-y-3'>
          <div className='flex items-center justify-between border-t pt-3 text-sm'>
            <span className='text-muted-foreground'>
              Số lượng: {order.total_items}
            </span>
            <span className='text-muted-foreground'>Tổng tiền</span>
          </div>
          <div className='flex items-center justify-between'>
            <Badge
              variant='secondary'
              className='font-normal text-muted-foreground'
            >
              {order.payment_status === 'paid'
                ? 'Đã thanh toán'
                : 'Chưa thanh toán'}
            </Badge>
            <span className='text-lg font-bold text-primary'>
              {formatCurrencyVnd(order.total)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button asChild className='mt-4 w-full' variant='outline'>
          <Link to={`/orders/${order.id}`}>Xem chi tiết</Link>
        </Button>
      </div>
    </Card>
  )
}
