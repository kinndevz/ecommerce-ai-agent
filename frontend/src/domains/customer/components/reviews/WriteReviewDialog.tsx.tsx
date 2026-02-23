import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { X } from 'lucide-react'
import { useCreateReview } from '@/hooks/useReview'
import { ReviewForm } from './ReviewForm'
import type { CreateReviewRequest } from '@/api/types/review.types'

interface WriteReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  productName: string
  productImage?: string
}

export function WriteReviewDialog({
  open,
  onOpenChange,
  productId,
  productName,
  productImage,
}: WriteReviewDialogProps) {
  const { mutate: createReview, isPending } = useCreateReview()

  const handleSubmit = (data: CreateReviewRequest) => {
    createReview(
      { productId, data },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-0'>
        {/* Header */}
        <div className='sticky top-0 z-10 bg-linear-to-r from-background to-muted/30 border-b backdrop-blur-xl'>
          <DialogHeader className='p-6 pb-4'>
            <div className='flex items-start justify-between gap-4'>
              <div className='flex items-start gap-4 flex-1'>
                {productImage && (
                  <div className='relative h-16 w-16 rounded-xl overflow-hidden bg-muted shrink-0 border-2 border-border/50'>
                    <img
                      src={productImage}
                      alt={productName}
                      className='h-full w-full object-cover'
                    />
                  </div>
                )}
                <div className='flex-1'>
                  <DialogTitle className='text-2xl font-bold mb-1'>
                    Viết đánh giá
                  </DialogTitle>
                  <p className='text-sm text-muted-foreground line-clamp-2'>
                    {productName}
                  </p>
                </div>
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 rounded-full shrink-0'
                onClick={() => onOpenChange(false)}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </DialogHeader>
        </div>

        {/* Form */}
        <ReviewForm onSubmit={handleSubmit} isPending={isPending} />
      </DialogContent>
    </Dialog>
  )
}
