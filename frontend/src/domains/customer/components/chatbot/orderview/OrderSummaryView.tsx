import { PackageCheck, Truck } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import type { OrderDetail } from '@/api/order.api'

import { OrderHeader } from './OrderHeader'
import { AddressInfo } from './AddressInfo'
import { OrderItem } from './OrderItem'
import { PaymentSummary } from './PaymentSummary'

interface OrderSummaryViewProps {
  order: OrderDetail
}

export const OrderSummaryView = ({ order }: OrderSummaryViewProps) => {
  return (
    <Card className='my-6 border-border/60 bg-card/90 shadow-sm'>
      <CardContent className='p-6 space-y-5'>
        <OrderHeader order={order} />

        <div className='grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]'>
          <div className='space-y-4'>
            <AddressInfo address={order.shipping_address} />

            <div className='space-y-3'>
              <div className='text-sm font-semibold text-foreground'>
                Items in your order
              </div>
              {order.items.map((item) => (
                <OrderItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          <PaymentSummary order={order} />
        </div>

        <div className='flex items-center gap-3 text-xs text-muted-foreground'>
          <PackageCheck className='w-4 h-4 text-primary' />
          Order placed successfully. We will update you on the delivery.
          <Truck className='w-4 h-4 text-primary ml-1' />
        </div>
      </CardContent>
    </Card>
  )
}
