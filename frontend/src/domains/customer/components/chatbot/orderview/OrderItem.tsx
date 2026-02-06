import type { OrderItem as OrderItemType } from '@/api/order.api'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'

interface OrderItemProps {
  item: OrderItemType
}

export const OrderItem = ({ item }: OrderItemProps) => {
  return (
    <div className='flex items-start justify-between gap-3 rounded-xl border border-border/50 bg-background p-3'>
      <div className='space-y-1'>
        <p className='font-medium text-sm text-foreground'>
          {item.product_name}
        </p>
        {item.variant_name && (
          <span className='text-xs text-muted-foreground'>
            {item.variant_name}
          </span>
        )}
        <p className='text-xs text-muted-foreground'>
          Qty: {item.quantity} • {formatCurrencyVnd(item.unit_price)}
        </p>
      </div>
      <span className='font-semibold text-sm text-foreground'>
        {formatCurrencyVnd(item.subtotal)}
      </span>
    </div>
  )
}
