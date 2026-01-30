import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export function EmptyCart() {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300'>
      <div className='mb-6 rounded-full bg-muted/30 p-8 ring-1 ring-border'>
        <ShoppingBag
          className='h-12 w-12 text-muted-foreground'
          strokeWidth={1.5}
        />
      </div>
      <h2 className='mb-2 text-2xl font-medium'>Your cart is empty</h2>
      <p className='mb-8 max-w-sm text-muted-foreground'>
        Looks like you haven't made your choice yet. Explore our collection and
        find something you love.
      </p>
      <Link to='/products'>
        <Button size='lg' className='min-w-40 rounded-full px-8'>
          Start Shopping
        </Button>
      </Link>
    </div>
  )
}
