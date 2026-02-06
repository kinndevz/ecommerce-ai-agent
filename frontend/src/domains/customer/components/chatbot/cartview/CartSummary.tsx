import { Wallet } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'

interface CartSummaryProps {
  subtotal: number
  onCheckout: () => void
}

export const CartSummary = ({ subtotal, onCheckout }: CartSummaryProps) => {
  return (
    <div className='bg-muted/20 px-6 py-6 border-t border-border'>
      <div className='space-y-3 mb-6'>
        <div className='flex justify-between text-sm text-muted-foreground'>
          <span>Tạm tính</span>
          <span className='text-foreground font-medium'>
            {formatCurrencyVnd(subtotal)}
          </span>
        </div>
        <div className='flex justify-between text-sm text-muted-foreground'>
          <span>Thuế ước tính</span>
          <span className='text-foreground font-medium'>
            Tính khi thanh toán
          </span>
        </div>
        <Separator className='my-2' />
        <div className='flex justify-between items-end'>
          <span className='text-base font-semibold'>Tổng cộng</span>
          <span className='text-2xl font-bold text-primary tracking-tight'>
            {formatCurrencyVnd(subtotal)}
          </span>
        </div>
      </div>

      <Button
        onClick={onCheckout}
        size='lg'
        className='w-full text-base font-bold shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all'
      >
        <Wallet className='w-5 h-5 mr-2' />
        Thanh toán ngay
      </Button>
    </div>
  )
}
