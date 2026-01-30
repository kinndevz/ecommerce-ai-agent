import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Tag } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Separator } from '@/shared/components/ui/separator'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'

interface CartSummaryProps {
  subtotal: number
  totalItems: number
}

export function CartSummary({ subtotal, totalItems }: CartSummaryProps) {
  return (
    <div className='rounded-xl border bg-card p-6 shadow-sm sticky top-24'>
      <h2 className='text-xl font-medium'>Order Summary</h2>

      <div className='mt-6 space-y-4'>
        <div className='flex items-center justify-between'>
          <span className='text-sm text-muted-foreground'>
            Subtotal ({totalItems} items)
          </span>
          <span className='font-medium tabular-nums'>
            {formatCurrencyVnd(subtotal)}
          </span>
        </div>

        <div className='flex items-center justify-between'>
          <span className='text-sm text-muted-foreground'>Shipping</span>
          <span className='text-sm text-muted-foreground'>
            Calculated at checkout
          </span>
        </div>

        <div className='space-y-2'>
          <label className='text-xs font-medium text-muted-foreground flex items-center gap-1'>
            <Tag className='w-3 h-3' /> Promo Code
          </label>
          <div className='flex gap-2'>
            <Input placeholder='Enter code' className='h-9 bg-background' />
            <Button variant='secondary' size='sm' className='h-9'>
              Apply
            </Button>
          </div>
        </div>

        <Separator />

        <div className='flex items-center justify-between py-2'>
          <span className='text-base font-semibold'>Total</span>
          <span className='text-2xl font-bold tracking-tight text-primary tabular-nums'>
            {formatCurrencyVnd(subtotal)}
          </span>
        </div>

        <Link to='/checkout' className='block pt-2'>
          <Button
            className='w-full h-12 text-base font-semibold shadow-md'
            size='lg'
          >
            Checkout
            <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        </Link>
      </div>

      <div className='mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground'>
        <ShieldCheck className='h-3.5 w-3.5 text-emerald-500' />
        <span>Secure SSL Encryption</span>
      </div>
    </div>
  )
}
