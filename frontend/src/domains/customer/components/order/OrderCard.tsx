import { Link } from 'react-router-dom'
import { Calendar, Package, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { cn } from '@/lib/utils'
import type { OrderHistoryItem } from '@/api/types/order.types'
import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge'
import { formatCurrencyVnd, formatShortDate } from '../../helpers/formatters'

interface OrderCardProps {
  order: OrderHistoryItem
  viewMode: 'list' | 'grid'
}

export function OrderCard({ order, viewMode }: OrderCardProps) {
  const OrderImage = () => (
    <div
      className={cn(
        'relative overflow-hidden bg-secondary/20',
        viewMode === 'list'
          ? 'w-full sm:w-48 h-48 sm:h-auto shrink-0 border-r-0 sm:border-r'
          : 'aspect-square w-full border-b'
      )}
    >
      {order.product_image ? (
        <img
          src={order.product_image}
          alt={order.order_number}
          className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
        />
      ) : (
        <div className='flex h-full w-full items-center justify-center flex-col gap-2 text-muted-foreground'>
          <Package className='h-8 w-8 opacity-50' />
        </div>
      )}

      {viewMode === 'grid' && (
        <div className='absolute top-2 right-2'>
          <OrderStatusBadge
            status={order.status}
            className='bg-background/90 backdrop-blur-sm shadow-sm'
          />
        </div>
      )}
    </div>
  )

  const OrderActions = () => (
    <div
      className={cn(
        'flex gap-2',
        viewMode === 'list' ? 'w-full sm:w-auto' : 'w-full'
      )}
    >
      <Button
        asChild
        variant='default'
        className='w-full shadow-sm hover:shadow-md transition-all'
      >
        <Link to={`/orders/${order.id}`}>
          Chi tiết <ChevronRight className='ml-1 h-4 w-4' />
        </Link>
      </Button>
    </div>
  )

  if (viewMode === 'grid') {
    return (
      <Card className='group flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50'>
        <OrderImage />

        <div className='flex flex-1 flex-col p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='font-mono text-sm font-medium text-muted-foreground'>
              #{order.order_number}
            </span>
            <span className='text-xs text-muted-foreground'>
              {formatShortDate(order.created_at)}
            </span>
          </div>

          <div className='mt-auto pt-4 space-y-3'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>Tổng tiền</span>
              <span className='font-bold text-primary text-lg'>
                {formatCurrencyVnd(order.total)}
              </span>
            </div>
            <PaymentStatusBadge
              status={order.payment_status}
              className='w-fit'
            />
          </div>
        </div>

        <div className='p-4 pt-0 mt-2'>
          <OrderActions />
        </div>
      </Card>
    )
  }

  return (
    <Card className='group flex flex-col sm:flex-row overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50'>
      <OrderImage />

      <div className='flex-1 flex flex-col p-4 sm:p-5'>
        <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4'>
          <div className='space-y-1.5'>
            <div className='flex items-center gap-2'>
              <h3 className='font-bold text-lg tracking-tight'>
                Đơn hàng #{order.order_number}
              </h3>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Calendar className='h-3.5 w-3.5' />
              <span>Đặt ngày {formatShortDate(order.created_at)}</span>
            </div>
          </div>

          <div className='text-left sm:text-right'>
            <p className='text-sm text-muted-foreground'>Tổng thành tiền</p>
            <p className='text-xl font-bold text-primary'>
              {formatCurrencyVnd(order.total)}
            </p>
          </div>
        </div>

        <div className='mt-4 sm:mt-auto pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-2 w-full sm:w-auto'>
            <span className='text-sm text-muted-foreground'>Thanh toán:</span>
            <PaymentStatusBadge status={order.payment_status} />
          </div>

          <OrderActions />
        </div>
      </div>
    </Card>
  )
}
