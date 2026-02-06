import type { OrderDetail } from '@/api/order.api'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'

interface PaymentSummaryProps {
  order: OrderDetail
}

export const PaymentSummary = ({ order }: PaymentSummaryProps) => {
  return (
    <div className='rounded-xl border border-border/60 bg-muted/5 p-4 space-y-3'>
      <div className='text-sm font-semibold text-foreground'>
        Payment summary
      </div>
      <div className='space-y-2 text-sm text-muted-foreground'>
        <div className='flex items-center justify-between'>
          <span>Subtotal</span>
          <span className='text-foreground'>
            {formatCurrencyVnd(order.subtotal)}
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <span>Shipping</span>
          <span className='text-foreground'>
            {formatCurrencyVnd(order.shipping_fee)}
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <span>Discount</span>
          <span className='text-foreground'>
            -{formatCurrencyVnd(order.discount)}
          </span>
        </div>
      </div>
      <div className='border-t border-border/60 pt-3 flex items-center justify-between'>
        <span className='text-base font-semibold text-foreground'>Total</span>
        <span className='text-xl font-bold text-primary'>
          {formatCurrencyVnd(order.total)}
        </span>
      </div>
    </div>
  )
}
