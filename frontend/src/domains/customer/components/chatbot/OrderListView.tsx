import { CalendarDays, Receipt, ShoppingBag } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from '@/api/services/order.constants'
import type { OrderListItem } from '@/api/order.api'
import { formatCurrencyVnd, formatShortDate } from '../../helpers/formatters'

interface OrderListViewProps {
  orders: OrderListItem[]
}

export const OrderListView = ({ orders }: OrderListViewProps) => {
  if (!orders.length) return null

  return (
    <div className='w-full max-w-4xl mx-auto my-6 space-y-4'>
      <div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
        <Receipt className='w-4 h-4 text-primary' />
        Your orders
      </div>

      <div className='space-y-3'>
        {orders.map((order) => {
          const statusStyle =
            ORDER_STATUS_CONFIG[order.status] ||
            ORDER_STATUS_CONFIG.pending ||
            {}
          const paymentStyle =
            PAYMENT_STATUS_CONFIG[order.payment_status] ||
            PAYMENT_STATUS_CONFIG.unpaid ||
            {}

          return (
            <Card
              key={order.id}
              className='border-border/60 bg-card/80 shadow-sm hover:shadow-md transition-all'
            >
              <CardContent className='p-4 space-y-3'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <div>
                    <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                      Order
                    </p>
                    <p className='font-semibold text-sm text-foreground'>
                      #{order.order_number}
                    </p>
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

                <div className='flex flex-wrap items-center gap-4 text-xs text-muted-foreground'>
                  <div className='flex items-center gap-1'>
                    <CalendarDays className='w-3.5 h-3.5' />
                    {formatShortDate(order.created_at)}
                  </div>
                  <div className='flex items-center gap-1'>
                    <ShoppingBag className='w-3.5 h-3.5' />
                    {order.total_items} items
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-xs text-muted-foreground'>
                    Total amount
                  </span>
                  <span className='text-base font-bold text-primary'>
                    {formatCurrencyVnd(order.total)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
