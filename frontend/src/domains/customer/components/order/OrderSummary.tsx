import { Headphones, MessageCircle } from 'lucide-react'
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

export function OrderSummary({ order }: { order: OrderDetail }) {
  const { mutate: cancelOrder, isPending } = useCancelOrder()

  const handleCancel = () => {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      cancelOrder(order.id)
    }
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Tóm tắt thanh toán</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          <div className='flex justify-between text-muted-foreground'>
            <span>Tạm tính</span>
            <span>{formatCurrencyVnd(order.subtotal)}</span>
          </div>
          <div className='flex justify-between text-muted-foreground'>
            <span>Phí vận chuyển</span>
            <span>{formatCurrencyVnd(order.shipping_fee)}</span>
          </div>
          <div className='flex justify-between text-muted-foreground'>
            <span>Giảm giá</span>
            <span>-{formatCurrencyVnd(order.discount)}</span>
          </div>
          <Separator />
          <div className='flex justify-between items-center pt-2'>
            <span className='font-semibold text-base'>Tổng cộng</span>
            <span className='font-bold text-xl text-primary'>
              {formatCurrencyVnd(order.total)}
            </span>
          </div>
        </CardContent>
        <CardFooter className='flex flex-col gap-3'>
          {order.payment_status === 'unpaid' &&
            order.status !== 'cancelled' && (
              <Button className='w-full bg-primary hover:bg-primary/90'>
                Thanh toán ngay
              </Button>
            )}

          {order.status === ORDER_STATUS.PENDING && (
            <Button
              variant='outline'
              className='w-full border-destructive/50 text-destructive hover:bg-destructive/5'
              onClick={handleCancel}
              disabled={isPending}
            >
              {isPending ? 'Đang xử lý...' : 'Hủy đơn hàng'}
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card className='bg-muted/30 border-none shadow-none'>
        <CardContent className='flex flex-col items-center justify-center p-6 text-center'>
          <div className='h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-sm mb-3'>
            <Headphones className='h-5 w-5 text-primary' />
          </div>
          <h4 className='font-semibold text-sm'>Cần hỗ trợ?</h4>
          <p className='text-xs text-muted-foreground mt-1 mb-4'>
            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng 24/7.
          </p>
          <Button variant='secondary' size='sm' className='w-full'>
            <MessageCircle className='h-4 w-4 mr-2' /> Chat ngay
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
