import { ShoppingBag } from 'lucide-react'
import type { OrderItem } from '@/api/order.api'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'
import { useProduct } from '@/hooks/useProducts'

interface OrderItemRowProps {
  item: OrderItem
}

export const OrderItemRow = ({ item }: OrderItemRowProps) => {
  const { data: productData } = useProduct(item.product_id)

  const images = productData?.data?.images || []
  const selectedImage = images.find((img) => img.is_primary) || images[0]

  const imageUrl = selectedImage?.image_url || null

  return (
    <div className='flex items-start gap-4 py-1'>
      {/* Image Container */}
      <div className='relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border/50 bg-muted/30 flex items-center justify-center'>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.product_name}
            className='h-full w-full object-cover'
          />
        ) : (
          <ShoppingBag className='h-6 w-6 text-muted-foreground/40' />
        )}
      </div>

      {/* Info */}
      <div className='flex flex-1 flex-col justify-center min-h-14'>
        <div className='flex justify-between items-start gap-2'>
          <div className='space-y-0.5'>
            <p className='text-sm font-semibold text-foreground line-clamp-2 leading-tight'>
              {item.product_name}
            </p>
            {item.variant_name && (
              <p className='text-xs text-muted-foreground'>
                {item.variant_name}
              </p>
            )}
          </div>
          <div className='text-right shrink-0'>
            <span className='text-xs text-muted-foreground font-medium'>
              Qty: {item.quantity}
            </span>
          </div>
        </div>
        <p className='text-sm font-medium text-foreground mt-1'>
          {formatCurrencyVnd(item.unit_price)}
        </p>
      </div>
    </div>
  )
}
