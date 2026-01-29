import { useState } from 'react'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Button } from '@/shared/components/ui/button'
import { MessageSquarePlus } from 'lucide-react'
import { useProductReviews } from '@/hooks/useReview'
import { RatingSummary } from '../reviews/RatingSummary'
import { ReviewCard } from '../reviews/ReviewCard'

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [page, setPage] = useState(1)
  const { data: response, isLoading } = useProductReviews(productId, {
    page,
    limit: 6,
  })

  return (
    <section className='py-16' id='reviews'>
      <div className='container mx-auto px-4'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <h2 className='text-3xl font-serif text-foreground'>
            Customer Reviews
          </h2>
          <Button>
            <MessageSquarePlus className='mr-2 h-4 w-4' />
            Write a Review
          </Button>
        </div>

        {/* Rating Summary Chart */}
        <div className='mb-12 max-w-4xl mx-auto'>
          <RatingSummary productId={productId} />
        </div>

        {/* Review List - Grid Layout */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          {isLoading ? (
            // Loading Skeleton
            [...Array(4)].map((_, i) => (
              <div key={i} className='p-6 border rounded-xl space-y-4'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-10 w-10 rounded-full' />
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-3 w-20' />
                  </div>
                </div>
                <Skeleton className='h-20 w-full' />
              </div>
            ))
          ) : response?.data && response.data.length > 0 ? (
            response.data.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <div className='col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-xl'>
              No reviews yet. Be the first to review this product!
            </div>
          )}
        </div>

        {/* Pagination (Simple Load More or Next/Prev) */}
        {response?.meta && response.meta.total_pages > 1 && (
          <div className='flex justify-center gap-2 mt-8'>
            <Button
              variant='outline'
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className='flex items-center px-4 font-medium text-sm'>
              Page {page} of {response.meta.total_pages}
            </span>
            <Button
              variant='outline'
              disabled={page === response.meta.total_pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
