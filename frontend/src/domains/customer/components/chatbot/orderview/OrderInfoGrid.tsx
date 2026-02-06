import { CreditCard } from 'lucide-react'
import type { OrderDetail } from '@/api/order.api'
import { PAYMENT_METHOD_CONFIG } from '@/api/services/order.constants'

interface OrderInfoGridProps {
  shippingAddress: OrderDetail['shipping_address']
  paymentMethod: OrderDetail['payment_method']
}

export const OrderInfoGrid = ({
  shippingAddress,
  paymentMethod,
}: OrderInfoGridProps) => {
  const paymentLabel = paymentMethod
    ? PAYMENT_METHOD_CONFIG[paymentMethod]?.label
    : 'Unknown'

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 py-2'>
      {/* Shipping Address */}
      <div className='space-y-2'>
        <div className='text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5'>
          SHIPPING ADDRESS
        </div>
        <div className='text-xs text-foreground space-y-1'>
          <p className='font-semibold text-sm'>{shippingAddress.name}</p>
          <p>{shippingAddress.address}</p>
          <p>
            {shippingAddress.ward ? `${shippingAddress.ward}, ` : ''}
            {shippingAddress.district ? `${shippingAddress.district}, ` : ''}
            {shippingAddress.city}
          </p>
        </div>
      </div>

      {/* Payment Method */}
      <div className='space-y-2'>
        <div className='text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5'>
          PAYMENT METHOD
        </div>
        <div className='flex items-center gap-2 text-xs font-medium text-foreground bg-muted/30 p-2 rounded-lg border border-border/50 w-fit'>
          <CreditCard className='w-4 h-4 text-primary' />
          {paymentLabel}
        </div>
      </div>
    </div>
  )
}
