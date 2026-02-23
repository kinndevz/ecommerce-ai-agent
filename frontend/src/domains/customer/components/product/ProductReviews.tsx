import { useState } from 'react'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Button } from '@/shared/components/ui/button'
import { MessageSquarePlus } from 'lucide-react'
import { useProductReviews } from '@/hooks/useReview'
import { RatingSummary } from '../reviews/RatingSummary'
import { ReviewCard } from '../reviews/ReviewCard'
import { WriteReviewDialog } from '../reviews/WriteReviewDialog.tsx'

interface ProductReviewsProps {
  productId: string
  productName: string
  productImage?: string
}

export function ProductReviews({
  productId,
  productName,
  productImage,
}: ProductReviewsProps) {
  const [page, setPage] = useState(1)
  const [showReviewDialog, setShowReviewDialog] = useState(false)

  const { data: response, isLoading } = useProductReviews(productId, {
    page,
    limit: 6,
  })

  return (
    <>
      <section className='py-16' id='reviews'>
        <div className='container mx-auto px-4'>
          {/* Header */}
          <div className='flex items-center justify-between mb-8'>
            <h2 className='text-3xl font-serif text-foreground'>
              Customer Reviews
            </h2>
            <Button
              onClick={() => setShowReviewDialog(true)}
              size='lg'
              className='shadow-lg'
            >
              <MessageSquarePlus className='mr-2 h-4 w-4' />
              Viết đánh giá
            </Button>
          </div>

          {/* Rating Summary Chart */}
          <div className='mb-12 max-w-4xl mx-auto'>
            <RatingSummary productId={productId} />
          </div>

          {/* Review List - Grid Layout */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            {isLoading ? (
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
                Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm
                này!
              </div>
            )}
          </div>

          {/* Pagination */}
          {response?.meta && response.meta.total_pages > 1 && (
            <div className='flex justify-center gap-2 mt-8'>
              <Button
                variant='outline'
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Trước
              </Button>
              <span className='flex items-center px-4 font-medium text-sm'>
                Trang {page} / {response.meta.total_pages}
              </span>
              <Button
                variant='outline'
                disabled={page === response.meta.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Write Review Dialog */}
      <WriteReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        productId={productId}
        productName={productName}
        productImage={productImage}
      />
    </>
  )
}
