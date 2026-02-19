import { useNavigate } from 'react-router-dom'
import { AlertCircle, RefreshCw, Home, Package } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import type { PaymentReturnData } from '@/api/types/payment.types'
import { ERROR_MESSAGES } from '@/api/services/order.constants'

interface PaymentFailedProps {
  data: PaymentReturnData | undefined
}

export function PaymentFailed({ data }: PaymentFailedProps) {
  const navigate = useNavigate()

  const errorMessage = data?.response_code
    ? ERROR_MESSAGES[data.response_code] || 'Giao dịch không thành công'
    : 'Giao dịch không thành công'

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      {/* Background Decoration */}
      <div className='fixed inset-0 -z-10 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl' />
        <div className='absolute bottom-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl' />
      </div>

      <Card className='w-full max-w-lg shadow-2xl border-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700'>
        <div className='absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-yellow-500 via-orange-400 to-yellow-500' />

        <CardContent className='p-8 space-y-6'>
          {/* Warning Icon */}
          <div className='flex flex-col items-center text-center space-y-4'>
            <div className='relative'>
              <div className='absolute inset-0 bg-yellow-500/20 rounded-full blur-2xl animate-pulse' />
              <div className='relative h-20 w-20 rounded-full bg-yellow-500/10 flex items-center justify-center'>
                <AlertCircle
                  className='h-12 w-12 text-yellow-500'
                  strokeWidth={2.5}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <h2 className='text-3xl font-bold text-yellow-600'>
                Thanh toán không thành công
              </h2>
              <p className='text-muted-foreground'>{errorMessage}</p>
            </div>
          </div>

          <Separator />

          {/* Error Details */}
          {data && (
            <div className='space-y-4'>
              <h3 className='font-semibold text-lg flex items-center gap-2'>
                <Package className='h-5 w-5 text-primary' />
                Chi tiết giao dịch
              </h3>

              <div className='space-y-3 bg-muted/30 rounded-xl p-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>
                    Mã đơn hàng
                  </span>
                  <span className='font-mono font-semibold'>
                    {data.order_number}
                  </span>
                </div>

                <Separator className='bg-border/50' />

                <div className='flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>Mã lỗi</span>
                  <span className='font-mono text-sm text-destructive font-semibold'>
                    {data.response_code}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Support Message */}
          <div className='bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-4'>
            <p className='text-sm text-blue-900 dark:text-blue-100 leading-relaxed'>
              <strong>💡 Gợi ý:</strong> Vui lòng kiểm tra thông tin tài khoản
              và thử lại. Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ ngân hàng
              hoặc bộ phận hỗ trợ của chúng tôi.
            </p>
          </div>

          {/* Actions */}
          <div className='flex flex-col sm:flex-row gap-3 pt-4'>
            <Button className='flex-1 h-12' onClick={() => navigate('/orders')}>
              <RefreshCw className='mr-2 h-4 w-4' />
              Thử lại
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
