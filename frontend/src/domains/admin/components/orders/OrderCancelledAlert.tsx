import { XCircle } from 'lucide-react'

export function OrderCancelledAlert() {
  return (
    <div className='p-4 bg-destructive/5 border border-destructive/20 rounded-xl flex items-center gap-4'>
      <div className='p-2 bg-destructive/10 rounded-full'>
        <XCircle className='w-6 h-6 text-destructive' />
      </div>
      <div>
        <p className='font-semibold text-destructive'>Order Cancelled</p>
        <p className='text-sm text-muted-foreground'>
          This order has been cancelled and cannot be updated.
        </p>
      </div>
    </div>
  )
}
