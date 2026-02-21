import { Link } from 'react-router-dom'
import { Calendar, Package, ChevronRight, Eye } from 'lucide-react'
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
  if (viewMode === 'grid') {
    return (
      <Link to={`/orders/${order.id}`}>
        <Card className='group h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 border-0 bg-card/80 backdrop-blur-sm'>
          <div className='absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/50 to-transparent' />

          {/* Image */}
          <div className='relative aspect-4/3 overflow-hidden bg-muted/30'>
            {order.product_image ? (
              <>
                <img
                  src={order.product_image}
                  alt={order.order_number}
                  className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-110'
                />
                <div className='absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              </>
            ) : (
              <div className='flex h-full w-full items-center justify-center'>
                <Package className='h-12 w-12 text-muted-foreground/30' />
              </div>
            )}

            {/* Status Badge */}
            <div className='absolute top-3 right-3'>
              <OrderStatusBadge
                status={order.status}
                className='bg-background/95 backdrop-blur-md shadow-lg'
              />
            </div>

            {/* View Overlay */}
            <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
              <div className='h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform'>
                <Eye className='h-5 w-5 text-primary-foreground' />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='p-5 space-y-4'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='font-mono text-sm font-semibold text-primary'>
                  #{order.order_number}
                </span>
                <div className='flex items-center text-xs text-muted-foreground'>
                  <Calendar className='h-3 w-3 mr-1' />
                  {formatShortDate(order.created_at)}
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <PaymentStatusBadge status={order.payment_status} />
                <span className='text-xs text-muted-foreground'>
                  • {order.total_items} sản phẩm
                </span>
              </div>
            </div>

            {/* Price */}
            <div className='pt-4 border-t flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Tổng tiền</span>
              <span className='text-xl font-bold text-primary'>
                {formatCurrencyVnd(order.total)}
              </span>
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  // List View
  return (
    <Link to={`/orders/${order.id}`}>
      <Card className='group overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 border-0 bg-card/80 backdrop-blur-sm'>
        <div className='absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/50 to-transparent' />

        <div className='flex flex-col sm:flex-row'>
          {/* Image */}
          <div className='relative w-full sm:w-48 h-48 sm:h-auto shrink-0 overflow-hidden bg-muted/30'>
            {order.product_image ? (
              <>
                <img
                  src={order.product_image}
                  alt={order.order_number}
                  className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-110'
                />
                <div className='absolute inset-0 bg-linear-to-r from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity' />
              </>
            ) : (
              <div className='flex h-full w-full items-center justify-center'>
                <Package className='h-12 w-12 text-muted-foreground/30' />
              </div>
            )}

            {/* View Icon */}
            <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:hidden'>
              <div className='h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg'>
                <Eye className='h-5 w-5 text-primary-foreground' />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='flex-1 p-5 sm:p-6 flex flex-col'>
            <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4 flex-1'>
              <div className='space-y-3 flex-1'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-3'>
                    <h3 className='text-lg font-bold'>#{order.order_number}</h3>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Calendar className='h-3.5 w-3.5' />
                    <span>{formatShortDate(order.created_at)}</span>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <PaymentStatusBadge status={order.payment_status} />
                  <span className='text-sm text-muted-foreground'>
                    • {order.total_items} sản phẩm
                  </span>
                </div>
              </div>

              <div className='text-left sm:text-right'>
                <p className='text-sm text-muted-foreground mb-1'>Tổng tiền</p>
                <p className='text-2xl font-bold text-primary'>
                  {formatCurrencyVnd(order.total)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className='mt-4 pt-4 border-t flex items-center justify-end'>
              <Button variant='default' size='sm' className='group/btn'>
                Xem chi tiết
                <ChevronRight className='ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1' />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
