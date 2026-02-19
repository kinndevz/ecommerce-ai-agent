import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import { formatCurrencyVnd } from '../../helpers/formatters'
import type { PaymentReturnData } from '@/api/types/payment.types'

interface PaymentSuccessProps {
  data: PaymentReturnData
}

export function PaymentSuccess({ data }: PaymentSuccessProps) {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      {/* Background Decoration */}
      <div className='fixed inset-0 -z-10 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl' />
        <div className='absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl' />
      </div>

      <Card className='w-full max-w-lg shadow-2xl border-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700'>
        <div className='absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500 via-emerald-400 to-emerald-500' />

        <CardContent className='p-8 space-y-6'>
          {/* Success Icon */}
          <div className='flex flex-col items-center text-center space-y-4'>
            <div className='relative'>
              <div className='absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse' />
              <div className='relative h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center'>
                <CheckCircle2
                  className='h-12 w-12 text-emerald-500'
                  strokeWidth={2.5}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <h2 className='text-3xl font-bold text-emerald-600'>
                Thanh toán thành công!
              </h2>
              <p className='text-muted-foreground'>
                Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
              </p>
            </div>
          </div>

          <Separator />

          {/* Payment Details */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-lg flex items-center gap-2'>
              <Package className='h-5 w-5 text-primary' />
              Thông tin thanh toán
            </h3>

            <div className='space-y-3 bg-muted/30 rounded-xl p-4'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>
                  Mã đơn hàng
                </span>
                <span className='font-mono font-semibold text-primary'>
                  {data.order_number}
                </span>
              </div>

              <Separator className='bg-border/50' />

              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>
                  Số tiền thanh toán
                </span>
                <span className='text-xl font-bold text-emerald-600'>
                  {formatCurrencyVnd(data.amount)}
                </span>
              </div>

              <Separator className='bg-border/50' />

              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>
                  Mã giao dịch
                </span>
                <span className='font-mono text-xs bg-background px-2 py-1 rounded'>
                  {data.transaction_no}
                </span>
              </div>

              <Separator className='bg-border/50' />

              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Ngân hàng</span>
                <span className='font-semibold'>{data.bank_code}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='flex flex-col sm:flex-row gap-3 pt-4'>
            <Button
              className='flex-1 h-12'
              onClick={() => navigate(`/orders/${data.order_id}`)}
            >
              <Package className='mr-2 h-4 w-4' />
              Xem đơn hàng
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              className='h-12'
              onClick={() => navigate('/')}
            >
              <Home className='mr-2 h-4 w-4' />
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
