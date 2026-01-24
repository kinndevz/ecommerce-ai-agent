import { Package } from 'lucide-react'
import { useProduct } from '@/hooks/useProducts'
import type { OrderItem } from '@/api/order.api'
import { formatVndCurrency } from '@/domains/admin/helpers/order.helpers'

interface OrderItemRowProps {
  item: OrderItem
}

export function OrderItemRow({ item }: OrderItemRowProps) {
  const { data: productResponse } = useProduct(item.product_id)

  const getItemImage = () => {
    if (!productResponse?.data) return null
    const product = productResponse.data
    if (product.images?.length) {
      const primaryImg = product.images.find((img) => img.is_primary)
      return primaryImg?.image_url || product.images[0]?.image_url
    }
    return null
  }

  const itemImage = getItemImage()

  return (
    <div className='flex items-center gap-4 p-4 bg-muted/30 rounded-lg'>
      <div className='w-16 h-16 rounded-lg border overflow-hidden bg-background shrink-0'>
        {itemImage ? (
          <img
            src={itemImage}
            alt={item.product_name}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <Package className='w-6 h-6 text-muted-foreground' />
          </div>
        )}
      </div>

      <div className='flex-1 min-w-0'>
        <h4 className='font-medium text-sm mb-1'>{item.product_name}</h4>
        {item.variant_name && (
          <p className='text-xs text-muted-foreground mb-1'>{item.variant_name}</p>
        )}
        <div className='text-xs text-muted-foreground'>
          {formatVndCurrency(item.unit_price)} × {item.quantity}
        </div>
      </div>

      <div className='text-right'>
        <p className='font-bold text-sm'>{formatVndCurrency(item.subtotal)}</p>
      </div>
    </div>
  )
}
