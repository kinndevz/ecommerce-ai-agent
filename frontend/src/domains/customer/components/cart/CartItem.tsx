import { Link } from 'react-router-dom'
import { Minus, Plus, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useUpdateCartItem, useRemoveCartItem } from '@/hooks/useCarts'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'
import type { CartItem } from '@/api/cart.api'

interface CartItemProps {
  item: CartItem
}

export function CartItem({ item }: CartItemProps) {
  const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem()
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem()

  const isPending = isUpdating || isRemoving

  return (
    <div
      className={`group relative flex gap-4 py-8 first:pt-4 last:pb-4 transition-opacity ${
        isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Product Image */}
      <div className='relative h-28 w-24 sm:h-32 sm:w-28 shrink-0 overflow-hidden rounded-md border bg-secondary/20'>
        <Link to={`/products/${item.product_slug}`}>
          <img
            src={item.product_image || ''}
            alt={item.product_name}
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
        </Link>
      </div>

      {/* Content */}
      <div className='flex flex-1 flex-col'>
        <div className='flex justify-between'>
          <div>
            <Link
              to={`/products/${item.product_slug}`}
              className='font-medium text-lg leading-tight hover:text-primary transition-colors line-clamp-2'
            >
              {item.product_name}
            </Link>
            {item.variant_name && (
              <p className='mt-1 text-sm text-muted-foreground flex items-center gap-2'>
                <span className='h-1 w-1 rounded-md bg-border' />
                {item.variant_name}
              </p>
            )}
          </div>

          <div className='text-right'>
            <p className='font-semibold text-lg tabular-nums'>
              {formatCurrencyVnd(item.subtotal)}
            </p>
          </div>
        </div>

        {/* Actions Row */}
        <div className='mt-auto flex items-center justify-between'>
          <div className='flex items-center rounded-md border bg-background p-1 shadow-sm'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 rounded-md'
              disabled={item.quantity <= 1 || isPending}
              onClick={() =>
                updateItem({
                  itemId: item.id,
                  data: { quantity: item.quantity - 1 },
                })
              }
            >
              <Minus className='h-3 w-3' />
            </Button>
            <span className='w-8 text-center text-sm font-medium'>
              {item.quantity}
            </span>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 rounded-md'
              disabled={isPending}
              onClick={() =>
                updateItem({
                  itemId: item.id,
                  data: { quantity: item.quantity + 1 },
                })
              }
            >
              <Plus className='h-3 w-3' />
            </Button>
          </div>

          <Button
            variant='ghost'
            size='sm'
            className='text-muted-foreground hover:text-destructive transition-colors'
            onClick={() => removeItem(item.id)}
          >
            <X className='h-4 w-4 mr-1' />
            <span className='text-xs uppercase tracking-wider font-semibold'>
              Remove
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
