import { ShoppingBag } from 'lucide-react'
import type { CartItem as CartItemType } from '@/api/cart.api'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'

interface CartItemProps {
  item: CartItemType
}

export const CartItem = ({ item }: CartItemProps) => {
  return (
    <div className='group flex items-center gap-4 bg-background hover:bg-muted/30 p-3 rounded-xl border border-border/50 hover:border-border transition-all duration-200'>
      <div className='w-16 h-16 shrink-0 bg-muted rounded-lg overflow-hidden flex items-center justify-center border border-border/50'>
        {item.product_image ? (
          <img
            src={item.product_image}
            alt={item.product_name}
            className='w-full h-full object-cover'
          />
        ) : (
          <ShoppingBag className='w-6 h-6 text-muted-foreground/50' />
        )}
      </div>

      <div className='flex-1 min-w-0'>
        <h4 className='font-semibold text-sm truncate pr-2 text-foreground'>
          {item.product_name}
        </h4>
        {item.variant_name && (
          <p className='text-[11px] text-muted-foreground truncate'>
            {item.variant_name}
          </p>
        )}
        <p className='text-sm font-bold text-primary mt-1'>
          {formatCurrencyVnd(item.price)}
        </p>
      </div>

      <div className='flex items-center justify-center bg-secondary/50 px-3 py-1 rounded-md border border-border/50'>
        <span className='text-xs font-medium text-muted-foreground whitespace-nowrap'>
          Qty:{' '}
          <span className='text-foreground font-bold'>{item.quantity}</span>
        </span>
      </div>
    </div>
  )
}
