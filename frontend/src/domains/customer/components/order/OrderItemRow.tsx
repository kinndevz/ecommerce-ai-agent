import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
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
    <div className='flex flex-col gap-4 py-6 sm:flex-row sm:items-center border-b last:border-0'>
      <div className='h-24 w-24 shrink-0 overflow-hidden rounded-lg border bg-muted/30'>
        {itemImage ? (
          <img
            src={itemImage}
            alt={item.product_name}
            className='h-full w-full object-cover'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center'>
            <Package className='h-8 w-8 text-muted-foreground/50' />
          </div>
        )}
      </div>

      <div className='flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div className='space-y-1'>
          <h4 className='font-medium line-clamp-2 text-base'>
            <Link
              to={`/products/${item.product_id}`}
              className='hover:underline'
            >
              {item.product_name}
            </Link>
          </h4>
          {item.variant_name && (
            <p className='text-sm text-muted-foreground'>
              Phân loại: {item.variant_name}
            </p>
          )}
          <p className='text-sm text-muted-foreground sm:hidden'>
            Qty: {item.quantity} × {formatCurrencyVnd(item.unit_price)}
          </p>
        </div>

        <div className='flex flex-row items-center justify-between gap-6 sm:flex-col sm:items-end sm:justify-center'>
          <div className='text-right hidden sm:block'>
            <p className='font-bold text-lg'>
              {formatCurrencyVnd(item.subtotal)}
            </p>
            <p className='text-xs text-muted-foreground'>
              {item.quantity} x {formatCurrencyVnd(item.unit_price)}
            </p>
          </div>

          <Button variant='outline' size='sm' className='h-8 text-xs'>
            Viết đánh giá
          </Button>
        </div>
      </div>
    </div>
  )
}
