import { useNavigate } from 'react-router-dom'
import { XCircle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'

interface PaymentErrorProps {
  error: Error
}

export function PaymentError({ error }: PaymentErrorProps) {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      {/* Background Decoration */}
      <div className='fixed inset-0 -z-10 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 right-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl' />
        <div className='absolute bottom-0 left-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl' />
      </div>

      <Card className='w-full max-w-lg shadow-2xl border-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700'>
        <div className='absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-destructive via-red-400 to-destructive' />

        <CardContent className='p-8 space-y-6'>
          {/* Error Icon */}
          <div className='flex flex-col items-center text-center space-y-4'>
            <div className='relative'>
              <div className='absolute inset-0 bg-destructive/20 rounded-full blur-2xl animate-pulse' />
              <div className='relative h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center'>
                <XCircle
                  className='h-12 w-12 text-destructive'
                  strokeWidth={2.5}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <h2 className='text-3xl font-bold text-destructive'>
                Xác thực thất bại
              </h2>
              <p className='text-muted-foreground'>
                {error?.message ||
                  'Không thể xác thực thanh toán. Vui lòng thử lại.'}
              </p>
            </div>
          </div>

          {/* Support Message */}
          <div className='bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-4'>
            <p className='text-sm text-red-900 dark:text-red-100 leading-relaxed'>
              <strong>⚠️ Lưu ý:</strong> Nếu bạn đã thanh toán thành công nhưng
              gặp lỗi này, vui lòng kiểm tra email hoặc liên hệ bộ phận hỗ trợ.
              Chúng tôi sẽ xác minh và xử lý đơn hàng của bạn ngay lập tức.
            </p>
          </div>

          {/* Actions */}
          <div className='flex flex-col sm:flex-row gap-3 pt-4'>
            <Button
              variant='outline'
              className='flex-1 h-12'
              onClick={() => navigate('/orders')}
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              Kiểm tra đơn hàng
            </Button>
            <Button className='h-12' onClick={() => navigate('/')}>
              <Home className='mr-2 h-4 w-4' />
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
