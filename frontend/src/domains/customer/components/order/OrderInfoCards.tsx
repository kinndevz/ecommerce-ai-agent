import { MapPin, CreditCard, User } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import type { OrderDetail } from '@/api/types/order.types'
import { PAYMENT_METHOD_CONFIG } from '@/api/services/order.constants'

export function OrderInfoCards({ order }: { order: OrderDetail }) {
  const address = order.shipping_address
  const fullAddress = [
    address.address,
    address.ward,
    address.district,
    address.city,
    address.country,
  ]
    .filter(Boolean)
    .join(', ')

  const paymentMethodLabel = order.payment_method
    ? PAYMENT_METHOD_CONFIG[order.payment_method]?.label
    : 'Khác'

  return (
    <div className='grid gap-6 md:grid-cols-2'>
      <Card>
        <CardHeader className='flex flex-row items-center gap-2 pb-2'>
          <MapPin className='h-4 w-4 text-muted-foreground' />
          <CardTitle className='text-base'>Địa chỉ nhận hàng</CardTitle>
        </CardHeader>
        <CardContent className='text-sm space-y-1'>
          <p className='font-semibold flex items-center gap-2'>
            <User className='h-3 w-3' /> {address.name}
          </p>
          <p className='text-muted-foreground'>{address.phone}</p>
          <p className='text-muted-foreground mt-2 leading-relaxed'>
            {fullAddress}
          </p>
          {order.notes && (
            <div className='mt-2 rounded bg-yellow-500/10 p-2 text-xs text-yellow-700 border border-yellow-500/20'>
              <span className='font-semibold'>Ghi chú:</span> {order.notes}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center gap-2 pb-2'>
          <CreditCard className='h-4 w-4 text-muted-foreground' />
          <CardTitle className='text-base'>Phương thức thanh toán</CardTitle>
        </CardHeader>
        <CardContent className='text-sm'>
          <div className='flex flex-col gap-2'>
            <p className='font-medium'>{paymentMethodLabel}</p>
            <p className='text-muted-foreground'>
              Trạng thái:{' '}
              <span
                className={
                  order.payment_status === 'paid'
                    ? 'text-green-600 font-medium'
                    : 'text-amber-600 font-medium'
                }
              >
                {order.payment_status === 'paid'
                  ? 'Đã thanh toán'
                  : 'Chưa thanh toán'}
              </span>
            </p>
            {order.payment_method === 'credit_card' && (
              <div className='flex items-center gap-2 mt-1'>
                <div className='h-6 w-10 rounded bg-foreground/10' />
                <span>**** **** **** 4242</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
