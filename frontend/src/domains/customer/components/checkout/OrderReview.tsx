import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { MapPin, CreditCard, StickyNote, CheckCircle2 } from 'lucide-react'
import type { ShippingAddress } from '@/api/types/order.types'
import type { PaymentMethodType } from '@/api/services/order.constants'
import { PAYMENT_METHOD_CONFIG } from '@/api/services/order.constants'

interface OrderReviewProps {
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethodType
  notes: string
  onBack: () => void
}

export function OrderReview({
  shippingAddress,
  paymentMethod,
  notes,
  onBack,
}: OrderReviewProps) {
  const fullAddress = [
    shippingAddress.address,
    shippingAddress.ward,
    shippingAddress.district,
    shippingAddress.city,
    shippingAddress.country,
  ]
    .filter(Boolean)
    .join(', ')

  const paymentMethodLabel =
    PAYMENT_METHOD_CONFIG[paymentMethod]?.label || 'Khác'

  return (
    <div className='space-y-6'>
      <Card className='shadow-md border-border/50'>
        <CardHeader className='border-b bg-linear-to-r from-card to-primary/5'>
          <CardTitle className='text-lg font-semibold flex items-center gap-2.5'>
            <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center'>
              <CheckCircle2 className='h-4 w-4 text-primary' />
            </div>
            <span>Xác nhận đơn hàng</span>
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6 space-y-6'>
          {/* Shipping Address */}
          <div>
            <div className='flex items-center gap-2 mb-3'>
              <MapPin className='h-4 w-4 text-primary' />
              <h3 className='font-semibold text-sm'>Thông tin giao hàng</h3>
            </div>
            <div className='pl-6 space-y-1.5 text-sm'>
              <p className='font-medium'>{shippingAddress.name}</p>
              <p className='text-muted-foreground'>{shippingAddress.phone}</p>
              <p className='text-muted-foreground leading-relaxed'>
                {fullAddress}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className='pt-4 border-t'>
            <div className='flex items-center gap-2 mb-3'>
              <CreditCard className='h-4 w-4 text-primary' />
              <h3 className='font-semibold text-sm'>Phương thức thanh toán</h3>
            </div>
            <div className='pl-6'>
              <p className='text-sm font-medium'>{paymentMethodLabel}</p>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className='pt-4 border-t'>
              <div className='flex items-center gap-2 mb-3'>
                <StickyNote className='h-4 w-4 text-primary' />
                <h3 className='font-semibold text-sm'>Ghi chú</h3>
              </div>
              <div className='pl-6'>
                <p className='text-sm text-muted-foreground leading-relaxed'>
                  {notes}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex items-center gap-3'>
        <Button
          type='button'
          variant='outline'
          onClick={onBack}
          className='h-11'
        >
          Quay lại
        </Button>
      </div>
    </div>
  )
}
