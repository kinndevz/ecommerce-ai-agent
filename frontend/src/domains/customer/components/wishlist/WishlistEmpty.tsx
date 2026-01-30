import { Link } from 'react-router-dom'
import { HeartOff } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export function WishlistEmpty() {
  return (
    <div className='flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500'>
      <div className='bg-muted/30 p-6 rounded-full mb-6'>
        <HeartOff className='w-12 h-12 text-muted-foreground' />
      </div>
      <h2 className='text-2xl font-medium text-foreground mb-2'>
        Your wishlist is empty
      </h2>
      <p className='text-muted-foreground max-w-md mb-8'>
        Looks like you haven't added anything to your wishlist yet. Explore our
        products and find something you love.
      </p>
      <Link to='/products'>
        <Button size='lg' className='min-w-50 font-medium'>
          Start Shopping
        </Button>
      </Link>
    </div>
  )
}
