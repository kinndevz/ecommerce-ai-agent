import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'

export function PaymentLoading() {
  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      {/* Background Decoration */}
      <div className='fixed inset-0 -z-10 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse' />
        <div className='absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse' />
      </div>

      <Card className='w-full max-w-md shadow-2xl border-0 overflow-hidden'>
        <div className='absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/50 to-transparent' />

        <CardContent className='flex flex-col items-center justify-center py-16 space-y-6'>
          <div className='relative'>
            <div className='absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse' />
            <Loader2 className='relative h-20 w-20 animate-spin text-primary' />
          </div>

          <div className='text-center space-y-2'>
            <h2 className='text-2xl font-bold'>Đang xác thực thanh toán</h2>
            <p className='text-sm text-muted-foreground'>
              Vui lòng đợi trong giây lát...
            </p>
          </div>

          {/* Progress dots */}
          <div className='flex gap-2'>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className='h-2 w-2 rounded-full bg-primary animate-pulse'
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
