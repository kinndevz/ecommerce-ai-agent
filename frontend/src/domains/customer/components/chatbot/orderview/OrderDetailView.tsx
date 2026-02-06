import { Card, CardContent } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import type { OrderDetail } from '@/api/order.api'
import { OrderItemRow } from './OrderItemRow'
import { OrderInfoGrid } from './OrderInfoGrid'
import { OrderSummaryFooter } from './OrderSummaryFooter'
import { OrderProgress } from './OderProgress'

interface OrderDetailViewProps {
  order: OrderDetail
}

export const OrderDetailView = ({ order }: OrderDetailViewProps) => {
  if (!order) return null

  return (
    <Card className='w-full max-w shadow-lg border-border/60 overflow-hidden bg-card'>
      <CardContent className='p-6 space-y-6'>
        {/* 1. Header & Progress */}
        <OrderProgress status={order.status} createdAt={order.created_at} />

        <Separator className='bg-border/50' />

        {/* 2. Items List */}
        <div className='space-y-3'>
          <h4 className='text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2'>
            ITEMS
          </h4>
          <div className='space-y-3'>
            {order.items.map((item) => (
              <OrderItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>

        <Separator className='bg-border/50' />

        {/* 3. Shipping & Payment Info */}
        <OrderInfoGrid
          shippingAddress={order.shipping_address}
          paymentMethod={order.payment_method}
        />

        {/* 4. Footer Summary & Actions */}
        <OrderSummaryFooter order={order} />
      </CardContent>
    </Card>
  )
}
