import { useState } from 'react'
import {
  Headphones,
  MessageCircle,
  CreditCard,
  Receipt,
  Sparkles,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import type { OrderDetail } from '@/api/types/order.types'
import { useCancelOrder } from '@/hooks/useOrders'
import { ORDER_STATUS } from '@/api/services/order.constants'
import { formatCurrencyVnd } from '../../helpers/formatters'
import { CancelOrderDialog } from './CancelOrderDialog'

export function OrderSummary({ order }: { order: OrderDetail }) {
  const { mutate: cancelOrder, isPending } = useCancelOrder()
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const handleCancelClick = () => {
    setShowCancelDialog(true)
  }

  const handleConfirmCancel = () => {
    cancelOrder(order.id, {
      onSuccess: () => {
        setShowCancelDialog(false)
      },
    })
  }

  const canCancel =
    order.status === ORDER_STATUS.PENDING ||
    order.status === ORDER_STATUS.PROCESSING

  return (
    <>
      <div className='space-y-4'>
        {/* Payment Summary Card */}
        <Card className='shadow-lg border-border/50 overflow-hidden backdrop-blur-sm bg-card/90'>
          <div className='absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/50 to-transparent' />

          <CardHeader className='pb-4 pt-5 bg-linear-to-br from-card to-primary/5'>
            <CardTitle className='text-lg font-semibold flex items-center gap-2.5'>
              <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                <Receipt className='h-4 w-4 text-primary' />
              </div>
              <span>Tóm tắt thanh toán</span>
            </CardTitle>
          </CardHeader>

          <CardContent className='space-y-4 px-5'>
            <div className='space-y-2.5 text-sm'>
              <div className='flex justify-between items-center py-2'>
                <span className='text-muted-foreground'>Tạm tính</span>
                <span className='font-semibold'>
                  {formatCurrencyVnd(order.subtotal)}
                </span>
              </div>

              <div className='flex justify-between items-center py-2'>
                <span className='text-muted-foreground'>Phí vận chuyển</span>
                <span className='font-semibold'>
                  {formatCurrencyVnd(order.shipping_fee)}
                </span>
              </div>

              {order.discount > 0 && (
                <div className='flex justify-between items-center py-2 px-3 -mx-3 rounded-lg bg-primary/5'>
                  <span className='text-primary font-medium flex items-center gap-1.5'>
                    <Sparkles className='h-3.5 w-3.5' />
                    Giảm giá
                  </span>
                  <span className='font-bold text-primary'>
                    -{formatCurrencyVnd(order.discount)}
                  </span>
                </div>
              )}
            </div>

            <Separator className='my-4' />

            <div className='flex justify-between items-center py-3 px-4 -mx-4 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20'>
              <span className='font-semibold text-base'>Tổng cộng</span>
              <div className='text-right'>
                <p className='font-bold text-2xl text-primary'>
                  {formatCurrencyVnd(order.total)}
                </p>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Đã bao gồm VAT
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className='flex flex-col gap-2.5 pt-3 pb-5 px-5 bg-muted/20'>
            {order.payment_status === 'unpaid' &&
              order.status !== 'cancelled' && (
                <Button className='w-full shadow-md hover:shadow-lg transition-all'>
                  <CreditCard className='mr-2 h-4 w-4' />
                  Thanh toán ngay
                </Button>
              )}

            {canCancel && (
              <Button
                variant='outline'
                className='w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive'
                onClick={handleCancelClick}
                disabled={isPending}
              >
                {isPending ? 'Đang xử lý...' : 'Hủy đơn hàng'}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Support Card */}
        <Card className='shadow-md border-border/50 overflow-hidden backdrop-blur-sm bg-card/90'>
          <CardContent className='flex flex-col items-center text-center p-6 space-y-3.5'>
            <div className='relative'>
              <div className='absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse' />
              <div className='relative h-14 w-14 rounded-full bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg'>
                <Headphones className='h-6 w-6 text-primary-foreground' />
              </div>
            </div>

            <div className='space-y-1'>
              <h4 className='font-semibold text-base'>Cần hỗ trợ?</h4>
              <p className='text-xs text-muted-foreground leading-relaxed'>
                Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
              </p>
            </div>

            <Button size='sm' variant='outline' className='w-full shadow-sm'>
              <MessageCircle className='h-4 w-4 mr-2' />
              Chat ngay
            </Button>
          </CardContent>
        </Card>
      </div>

      <CancelOrderDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleConfirmCancel}
        isPending={isPending}
      />
    </>
  )
}
