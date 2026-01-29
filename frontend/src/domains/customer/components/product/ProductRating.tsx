import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductRatingProps {
  rating: number
  count: number
}

export function ProductRating({ rating, count }: ProductRatingProps) {
  return (
    <div className='flex items-center gap-2 mb-4'>
      <div className='flex'>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={cn(
              'mr-0.5',
              i < Math.round(rating)
                ? 'fill-primary text-primary'
                : 'fill-muted text-muted'
            )}
          />
        ))}
      </div>
      <span className='text-sm text-muted-foreground font-medium underline decoration-muted-foreground/30 underline-offset-4'>
        {count} reviews
      </span>
    </div>
  )
}
