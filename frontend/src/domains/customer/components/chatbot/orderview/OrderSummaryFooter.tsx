import { Download, Headset } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import type { OrderDetail } from '@/api/order.api'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'

interface OrderSummaryFooterProps {
  order: OrderDetail
}

export const OrderSummaryFooter = ({ order }: OrderSummaryFooterProps) => {
  return (
    <div className='bg-muted/10 -mx-6 -mb-6 p-6 space-y-5 border-t border-border/50'>
      {/* Summary Lines */}
      <div className='space-y-2 text-xs'>
        <div className='flex justify-between text-muted-foreground'>
          <span>Subtotal</span>
          <span className='font-medium text-foreground'>
            {formatCurrencyVnd(order.subtotal)}
          </span>
        </div>
        <div className='flex justify-between text-muted-foreground'>
          <span>Shipping</span>
          <span className='font-medium text-foreground'>
            {formatCurrencyVnd(order.shipping_fee)}
          </span>
        </div>
        {order.discount > 0 && (
          <div className='flex justify-between text-emerald-600'>
            <span>Discount</span>
            <span className='font-medium'>
              -{formatCurrencyVnd(order.discount)}
            </span>
          </div>
        )}
        <Separator className='my-2' />
        <div className='flex justify-between text-sm'>
          <span className='font-bold text-foreground'>Total</span>
          <span className='font-bold text-lg text-primary'>
            {formatCurrencyVnd(order.total)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='grid grid-cols-2 gap-3'>
        <Button
          variant='default'
          className='w-full font-semibold shadow-sm text-xs h-9'
        >
          <Download className='w-3.5 h-3.5 mr-2' />
          Download Invoice
        </Button>
        <Button
          variant='secondary'
          className='w-full font-semibold text-xs h-9 bg-background hover:bg-muted border border-border/50'
        >
          <Headset className='w-3.5 h-3.5 mr-2' />
          Contact Support
        </Button>
      </div>
    </div>
  )
}
