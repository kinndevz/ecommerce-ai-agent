import { Star } from 'lucide-react'
import { Progress } from '@/shared/components/ui/progress'
import { useProductRatingSummary } from '@/hooks/useReview'
import { Skeleton } from '@/shared/components/ui/skeleton'

interface RatingSummaryProps {
  productId: string
}

export function RatingSummary({ productId }: RatingSummaryProps) {
  const { data: summary, isLoading } = useProductRatingSummary(productId)

  if (isLoading) {
    return <RatingSummarySkeleton />
  }

  if (!summary?.data || summary.data.review_count === 0) {
    return null
  }

  const { average_rating, review_count } = summary.data

  // Calculate filled stars
  const filledStars = Math.round(average_rating)

  // Rating distribution
  const ratingDistribution = [
    { stars: 5, percentage: 70 },
    { stars: 4, percentage: 17 },
    { stars: 3, percentage: 7 },
    { stars: 2, percentage: 4 },
    { stars: 1, percentage: 2 },
  ]

  return (
    <div className='space-y-4'>
      {/* Stars and Rating */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-1'>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= filledStars
                  ? 'fill-orange-400 text-orange-400'
                  : 'text-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        <span className='text-lg font-bold'>{average_rating.toFixed(1)}</span>
      </div>

      {/* Review Count */}
      <p className='text-sm text-muted-foreground'>
        ({review_count} {review_count === 1 ? 'review' : 'reviews'})
      </p>

      {/* Rating Bars */}
      <div className='space-y-3 pt-2'>
        {ratingDistribution.map(({ stars, percentage }) => (
          <div key={stars} className='space-y-1.5'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>{stars} stars</span>
              <span className='font-medium'>{percentage}%</span>
            </div>
            <Progress value={percentage} className='h-2' />
          </div>
        ))}
      </div>
    </div>
  )
}

function RatingSummarySkeleton() {
  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <Skeleton className='h-5 w-32' />
        <Skeleton className='h-6 w-12' />
      </div>
      <Skeleton className='h-4 w-24' />
      <div className='space-y-3 pt-2'>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className='space-y-1.5'>
            <div className='flex justify-between'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 w-10' />
            </div>
            <Skeleton className='h-2 w-full' />
          </div>
        ))}
      </div>
    </div>
  )
}
