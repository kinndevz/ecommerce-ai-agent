import { Skeleton } from '@/shared/components/ui/skeleton'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProductRatingSummary } from '@/hooks/useReview'
import { calculatePercentage, getRatingColor } from '../../helpers/reviews'
import { RatingSummarySkeleton } from './RatingSummarySkeleton'

interface RatingSummaryProps {
  productId: string
}

export function RatingSummary({ productId }: RatingSummaryProps) {
  const { data: response, isLoading } = useProductRatingSummary(productId)

  if (isLoading) return <RatingSummarySkeleton />
  if (!response?.data) return null

  const { average_rating, review_count } = response.data

  // mock
  const distribution = {
    5: Math.round(review_count * 0.7),
    4: Math.round(review_count * 0.2),
    3: Math.round(review_count * 0.05),
    2: Math.round(review_count * 0.03),
    1: Math.round(review_count * 0.02),
  }

  return (
    <div className='bg-card rounded-xl p-6 md:p-8 border border-border/50'>
      <div className='flex flex-col md:flex-row items-center gap-8 md:gap-12'>
        {/* Left: Big Score */}
        <div className='text-center shrink-0'>
          <div className='text-5xl font-serif text-foreground mb-2'>
            {average_rating.toFixed(1)}
            <span className='text-2xl text-muted-foreground font-sans'>/5</span>
          </div>
          <div className='flex justify-center gap-1 mb-2'>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={18}
                className={cn(
                  i < Math.round(average_rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-200 fill-gray-200'
                )}
              />
            ))}
          </div>
          <p className='text-sm text-muted-foreground'>
            Based on {review_count} reviews
          </p>
        </div>

        {/* Right: Progress Bars */}
        <div className='flex-1 w-full space-y-3'>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star as keyof typeof distribution] || 0
            const percent = calculatePercentage(count, review_count)

            return (
              <div key={star} className='flex items-center gap-4 text-sm'>
                <div className='flex items-center gap-1 w-8 shrink-0 font-medium'>
                  {star} <Star size={12} className='text-muted-foreground' />
                </div>

                <div className='flex-1 h-2.5 bg-secondary/50 rounded-full overflow-hidden'>
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      getRatingColor(star)
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <span className='w-8 shrink-0 text-right text-muted-foreground text-xs'>
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
