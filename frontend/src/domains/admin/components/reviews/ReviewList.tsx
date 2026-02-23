import { ReviewCard } from './ReviewCard'
import { ReviewListSkeleton } from './ReviewListSkeleton'
import { ReviewEmptyState } from './ReviewEmptyState'
import { Button } from '@/shared/components/ui/button'
import type { Review } from '@/api/types/review.types'

interface ReviewListProps {
  reviews: Review[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ReviewList({
  reviews,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: ReviewListProps) {
  if (isLoading) {
    return (
      <div className='p-6'>
        <ReviewListSkeleton />
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className='p-6'>
        <ReviewEmptyState />
      </div>
    )
  }

  const hasMore = currentPage < totalPages

  return (
    <div>
      {/* Reviews */}
      <div className='divide-y'>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className='p-6 border-t'>
          <Button
            variant='outline'
            onClick={() => onPageChange(currentPage + 1)}
            className='w-full'
          >
            Load more...
          </Button>
        </div>
      )}
    </div>
  )
}
