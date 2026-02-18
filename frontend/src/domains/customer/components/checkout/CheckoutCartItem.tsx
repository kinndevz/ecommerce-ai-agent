import { Package } from 'lucide-react'
import { formatCurrencyVnd } from '../../helpers/formatters'
import type { CartItem } from '@/api/types/cart.types'

interface CheckoutCartItemProps {
  item: CartItem
}

export function CheckoutCartItem({ item }: CheckoutCartItemProps) {
  return (
    <div className='flex gap-3'>
      {/* Image */}
      <div className='relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted'>
        {item.product_image ? (
          <img
            src={item.product_image}
            alt={item.product_name}
            className='h-full w-full object-cover'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center'>
            <Package className='h-6 w-6 text-muted-foreground' />
          </div>
        )}

        {/* Quantity Badge */}
        <div className='absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center'>
          <span className='text-xs font-bold text-primary-foreground'>
            {item.quantity}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className='flex-1 min-w-0'>
        <h4 className='font-medium text-sm line-clamp-2 leading-tight mb-1'>
          {item.product_name}
        </h4>
        {item.variant_name && (
          <p className='text-xs text-muted-foreground mb-1'>
            {item.variant_name}
          </p>
        )}
        <div className='flex items-center justify-between'>
          <span className='text-xs text-muted-foreground'>
            {item.quantity} × {formatCurrencyVnd(item.price)}
          </span>
          <span className='font-semibold text-sm text-primary'>
            {formatCurrencyVnd(item.subtotal)}
          </span>
        </div>
      </div>
    </div>
  )
}
