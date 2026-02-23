import { useState } from 'react'
import { MessageSquarePlus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useProductReviews } from '@/hooks/useReview'
import { RatingSummary } from './RatingSummary'
import { ReviewList } from './ReviewList'

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [page, setPage] = useState(1)
  const LIMIT = 10

  const { data: response, isLoading } = useProductReviews(productId, {
    page,
    limit: LIMIT,
  })

  const reviews = response?.data || []
  const totalPages = response?.meta?.total_pages || 1

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-bold text-foreground'>Reviews</h2>
        <Button variant='outline' size='sm' className='gap-2'>
          <MessageSquarePlus className='h-4 w-4' />
          Submit Review
        </Button>
      </div>

      {/* Content Container - matches layout above */}
      <div className='grid grid-cols-12 gap-8'>
        {/* Left: Review List (col-span-8 to match product gallery) */}
        <div className='col-span-12 lg:col-span-8'>
          <div className='border rounded-lg bg-card'>
            <ReviewList
              reviews={reviews}
              isLoading={isLoading}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>

        {/* Right: Rating Summary (col-span-4) */}
        <div className='col-span-12 lg:col-span-4'>
          <div className='border rounded-lg bg-card p-6 lg:sticky lg:top-6'>
            <RatingSummary productId={productId} />
          </div>
        </div>
      </div>
    </div>
  )
}
