import { CalendarDays, MapPin, PackageCheck, Truck, Wallet } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from '@/api/services/order.constants'

interface ShippingAddress {
  name: string
  phone: string
  address: string
  city: string
  district?: string | null
  ward?: string | null
  country?: string | null
}

interface OrderItem {
  id: string
  product_name: string
  variant_name?: string | null
  quantity: number
  unit_price: number
  subtotal: number
}

interface OrderDetail {
  id: string
  order_number: string
  status: string
  payment_status: string
  payment_method?: string | null
  subtotal: number
  discount: number
  shipping_fee: number
  total: number
  shipping_address: ShippingAddress
  notes?: string | null
  items: OrderItem[]
  created_at: string
}

interface OrderSummaryViewProps {
  order: OrderDetail
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    price
  )

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })

export const OrderSummaryView = ({ order }: OrderSummaryViewProps) => {
  const statusStyle =
    ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending || {}
  const paymentStyle =
    PAYMENT_STATUS_CONFIG[order.payment_status] || PAYMENT_STATUS_CONFIG.unpaid || {}

  return (
    <Card className='my-6 border-border/60 bg-card/90 shadow-sm'>
      <CardContent className='p-6 space-y-5'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='space-y-2'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>
              Order created
            </p>
            <p className='text-2xl font-semibold text-foreground'>
              #{order.order_number}
            </p>
            <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
              <span className='flex items-center gap-1'>
                <CalendarDays className='w-3.5 h-3.5' />
                {formatDate(order.created_at)}
              </span>
              {order.payment_method && (
                <span className='flex items-center gap-1'>
                  <Wallet className='w-3.5 h-3.5' />
                  {order.payment_method}
                </span>
              )}
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='outline' className={statusStyle.className}>
              {statusStyle.label || order.status}
            </Badge>
            <Badge variant='outline' className={paymentStyle.className}>
              {paymentStyle.label || order.payment_status}
            </Badge>
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]'>
          <div className='space-y-4'>
            <div className='rounded-xl border border-border/60 bg-muted/10 p-4 space-y-2'>
              <div className='flex items-center gap-2 text-sm font-semibold'>
                <MapPin className='w-4 h-4 text-primary' />
                Shipping address
              </div>
              <p className='text-sm text-foreground'>
                {order.shipping_address.name} • {order.shipping_address.phone}
              </p>
              <p className='text-sm text-muted-foreground'>
                {order.shipping_address.address},{' '}
                {order.shipping_address.ward
                  ? `${order.shipping_address.ward}, `
                  : ''}
                {order.shipping_address.district
                  ? `${order.shipping_address.district}, `
                  : ''}
                {order.shipping_address.city}
              </p>
            </div>

            <div className='space-y-3'>
              <div className='text-sm font-semibold text-foreground'>
                Items in your order
              </div>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className='flex items-start justify-between gap-3 rounded-xl border border-border/50 bg-background p-3'
                >
                  <div className='space-y-1'>
                    <p className='font-medium text-sm text-foreground'>
                      {item.product_name}
                    </p>
                    {item.variant_name && (
                      <span className='text-xs text-muted-foreground'>
                        {item.variant_name}
                      </span>
                    )}
                    <p className='text-xs text-muted-foreground'>
                      Qty: {item.quantity} • {formatPrice(item.unit_price)}
                    </p>
                  </div>
                  <span className='font-semibold text-sm text-foreground'>
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className='rounded-xl border border-border/60 bg-muted/5 p-4 space-y-3'>
            <div className='text-sm font-semibold text-foreground'>
              Payment summary
            </div>
            <div className='space-y-2 text-sm text-muted-foreground'>
              <div className='flex items-center justify-between'>
                <span>Subtotal</span>
                <span className='text-foreground'>
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Shipping</span>
                <span className='text-foreground'>
                  {formatPrice(order.shipping_fee)}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Discount</span>
                <span className='text-foreground'>
                  -{formatPrice(order.discount)}
                </span>
              </div>
            </div>
            <div className='border-t border-border/60 pt-3 flex items-center justify-between'>
              <span className='text-base font-semibold text-foreground'>
                Total
              </span>
              <span className='text-xl font-bold text-primary'>
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
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
