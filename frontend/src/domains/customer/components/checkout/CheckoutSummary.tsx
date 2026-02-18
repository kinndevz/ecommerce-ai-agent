import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { CheckoutCartItem } from './CheckoutCartItem'
import { formatCurrencyVnd } from '../../helpers/formatters'
import type { CartData } from '@/api/types/cart.types'

interface CheckoutSummaryProps {
  cart: CartData | undefined
  isLoading: boolean
  currentStep: number
  onPlaceOrder: () => void
  isPlacingOrder: boolean
}

const SHIPPING_FEE = 30000

export function CheckoutSummary({
  cart,
  isLoading,
  currentStep,
  onPlaceOrder,
  isPlacingOrder,
}: CheckoutSummaryProps) {
  if (isLoading || !cart) {
    return (
      <Card className='shadow-lg border-border/50'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        </CardContent>
      </Card>
    )
  }

  const subtotal = cart.subtotal
  const total = subtotal + SHIPPING_FEE

  return (
    <Card className='shadow-lg border-border/50 backdrop-blur-sm bg-card/90'>
      <div className='absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/50 to-transparent' />

      <CardHeader className='pb-4 pt-5 bg-linear-to-br from-card to-primary/5'>
        <CardTitle className='text-lg font-semibold flex items-center gap-2.5'>
          <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center'>
            <ShoppingBag className='h-4 w-4 text-primary' />
          </div>
          <span>Đơn hàng của bạn</span>
          <span className='ml-auto text-sm font-normal text-muted-foreground'>
            ({cart.total_items} sản phẩm)
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className='p-0'>
        {/* Cart Items */}
        <div className='max-h-100 overflow-y-auto px-5 py-4'>
          <div className='space-y-4'>
            {cart.items.map((item) => (
              <CheckoutCartItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        <Separator />

        {/* Summary */}
        <div className='px-5 py-4 space-y-3 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Tạm tính</span>
            <span className='font-medium'>{formatCurrencyVnd(subtotal)}</span>
          </div>

          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Phí vận chuyển</span>
            <span className='font-medium'>
              {formatCurrencyVnd(SHIPPING_FEE)}
            </span>
          </div>

          <Separator />

          <div className='flex justify-between items-center pt-2'>
            <span className='font-semibold text-base'>Tổng cộng</span>
            <div className='text-right'>
              <p className='font-bold text-2xl text-primary'>
                {formatCurrencyVnd(total)}
              </p>
              <p className='text-xs text-muted-foreground'>Đã bao gồm VAT</p>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        {currentStep === 3 && (
          <div className='px-5 pb-5'>
            <Button
              className='w-full h-12 text-base font-semibold'
              onClick={onPlaceOrder}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                  Đang xử lý...
                </>
              ) : (
                'Đặt hàng'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
