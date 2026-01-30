import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/shared/components/ui/button'

export function ContinueShopping() {
  return (
    <Link
      to='/products'
      className={cn(
        buttonVariants({ variant: 'outline', size: 'default' }),
        'group h-11 gap-2 border-muted-foreground/20 px-6 text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-background transition-all duration-300'
      )}
    >
      <ArrowLeft className='h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1' />
      <span className='font-medium'>Continue Shopping</span>
    </Link>
  )
}
