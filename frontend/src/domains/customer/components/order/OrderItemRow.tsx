import { Link } from 'react-router-dom'
import { Package, Star } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useProduct } from '@/hooks/useProducts'
import type { OrderItem } from '@/api/types/order.types'
import { formatCurrencyVnd } from '../../helpers/formatters'

interface OrderItemRowProps {
  item: OrderItem
}

export function OrderItemRow({ item }: OrderItemRowProps) {
  const { data: productResponse } = useProduct(item.product_id)

  const getItemImage = () => {
    if (!productResponse?.data) return null
    const product = productResponse.data
    if (product.images?.length) {
      const primaryImg = product.images.find((img: any) => img.is_primary)
      return primaryImg?.image_url || product.images[0]?.image_url
    }
    return null
  }

  const itemImage = getItemImage()

  return (
    <div className='flex flex-col gap-4 py-5 sm:flex-row sm:items-center group'>
      {/* Product Image */}
      <Link
        to={`/products/${item.product_id}`}
        className='relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-border group-hover:border-primary/50 transition-all duration-300 group-hover:shadow-md'
      >
        {itemImage ? (
          <>
            <img
              src={itemImage}
              alt={item.product_name}
              className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
            />
            <div className='absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
          </>
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-muted'>
            <Package className='h-8 w-8 text-muted-foreground' />
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className='flex flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center'>
        <div className='space-y-1.5 flex-1'>
          <h4 className='font-semibold text-sm leading-tight text-foreground group-hover:text-primary transition-colors'>
            <Link to={`/products/${item.product_id}`}>{item.product_name}</Link>
          </h4>

          {item.variant_name && (
            <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20'>
              <div className='h-1.5 w-1.5 rounded-full bg-primary' />
              <span className='text-xs font-medium text-primary'>
                {item.variant_name}
              </span>
            </div>
          )}

          <p className='text-xs text-muted-foreground sm:hidden flex items-center gap-1.5'>
            <span className='font-medium'>{item.quantity}</span>
            <span>×</span>
            <span className='font-semibold'>
              {formatCurrencyVnd(item.unit_price)}
            </span>
          </p>
        </div>

        {/* Price & Action */}
        <div className='flex flex-row items-center justify-between gap-6 sm:flex-col sm:items-end sm:gap-2.5'>
          <div className='text-right hidden sm:block'>
            <p className='font-bold text-lg text-primary'>
              {formatCurrencyVnd(item.subtotal)}
            </p>
            <p className='text-xs text-muted-foreground flex items-center gap-1 justify-end'>
              <span className='font-medium'>{item.quantity}</span>
              <span>×</span>
              <span>{formatCurrencyVnd(item.unit_price)}</span>
            </p>
          </div>

          <Button
            variant='outline'
            size='sm'
            className='h-8 text-xs border-primary/30 hover:bg-primary/10 hover:border-primary transition-all group/btn'
          >
            <Star className='mr-1.5 h-3 w-3 group-hover/btn:fill-primary group-hover/btn:text-primary transition-all' />
            Đánh giá
          </Button>
        </div>
      </div>
    </div>
  )
}
