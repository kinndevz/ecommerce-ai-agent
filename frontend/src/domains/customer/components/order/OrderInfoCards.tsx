import { MapPin, CreditCard, User, Phone, StickyNote } from 'lucide-react'
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
      {/* Shipping Address Card */}
      <Card className='shadow-md border-border/50 overflow-hidden backdrop-blur-sm bg-card/80 group hover:shadow-lg transition-all duration-300'>
        <div className='absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary via-primary/50 to-transparent' />

        <CardHeader className='border-b bg-linear-to-br from-card to-primary/5'>
          <CardTitle className='text-base font-semibold flex items-center gap-2.5'>
            <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform'>
              <MapPin className='h-4 w-4 text-primary' />
            </div>
            <span>Địa chỉ nhận hàng</span>
          </CardTitle>
        </CardHeader>

        <CardContent className='p-5 space-y-4'>
          <div className='space-y-3.5 text-sm'>
            <div className='flex items-start gap-3'>
              <div className='h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5'>
                <User className='h-4 w-4 text-muted-foreground' />
              </div>
              <div className='flex-1'>
                <p className='text-xs text-muted-foreground uppercase tracking-wide mb-1'>
                  Người nhận
                </p>
                <p className='font-semibold text-foreground'>{address.name}</p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <div className='h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5'>
                <Phone className='h-4 w-4 text-muted-foreground' />
              </div>
              <div className='flex-1'>
                <p className='text-xs text-muted-foreground uppercase tracking-wide mb-1'>
                  Số điện thoại
                </p>
                <p className='font-semibold text-foreground'>{address.phone}</p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <div className='h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5'>
                <MapPin className='h-4 w-4 text-muted-foreground' />
              </div>
              <div className='flex-1'>
                <p className='text-xs text-muted-foreground uppercase tracking-wide mb-1'>
                  Địa chỉ
                </p>
                <p className='leading-relaxed text-foreground/90'>
                  {fullAddress}
                </p>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className='pt-4 border-t border-border/50'>
              <div className='flex items-start gap-3'>
                <div className='h-8 w-8 rounded-lg bg-accent/30 flex items-center justify-center shrink-0 mt-0.5'>
                  <StickyNote className='h-4 w-4 text-accent-foreground' />
                </div>
                <div className='flex-1'>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide mb-2'>
                    Ghi chú
                  </p>
                  <div className='p-3 rounded-lg bg-accent/20 border border-accent/40'>
                    <p className='text-sm text-accent-foreground leading-relaxed'>
                      {order.notes}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Card */}
      <Card className='shadow-md border-border/50 overflow-hidden backdrop-blur-sm bg-card/80 group hover:shadow-lg transition-all duration-300'>
        <div className='absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary via-primary/50 to-transparent' />

        <CardHeader className='border-b bg-linear-to-br from-card to-primary/5'>
          <CardTitle className='text-base font-semibold flex items-center gap-2.5'>
            <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform'>
              <CreditCard className='h-4 w-4 text-primary' />
            </div>
            <span>Phương thức thanh toán</span>
          </CardTitle>
        </CardHeader>

        <CardContent className='p-5 space-y-4'>
          <div className='text-sm space-y-4'>
            <div>
              <p className='text-xs uppercase tracking-wide text-muted-foreground mb-2.5'>
                Phương thức
              </p>
              <div className='flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50'>
                <div className='h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0'>
                  <CreditCard className='h-5 w-5 text-foreground' />
                </div>
                <div className='flex-1'>
                  <p className='font-semibold text-foreground'>
                    {paymentMethodLabel}
                  </p>
                  {order.payment_method === 'credit_card' && (
                    <p className='text-xs text-muted-foreground font-mono mt-0.5'>
                      •••• •••• •••• 4242
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className='text-xs uppercase tracking-wide text-muted-foreground mb-2.5'>
                Trạng thái thanh toán
              </p>
              <div
                className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-lg font-semibold text-sm shadow-sm ${
                  order.payment_status === 'paid'
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'bg-accent/50 text-accent-foreground border border-accent'
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    order.payment_status === 'paid'
                      ? 'bg-primary'
                      : 'bg-accent-foreground animate-pulse'
                  }`}
                ></div>
                {order.payment_status === 'paid'
                  ? 'Đã thanh toán'
                  : 'Chưa thanh toán'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
