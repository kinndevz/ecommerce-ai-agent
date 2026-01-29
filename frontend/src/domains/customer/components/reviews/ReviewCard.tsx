import { Star, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/lib/utils'
import type { Review } from '@/api/review.api'
import { formatShortDate } from '../../helpers/formatters'

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  // Tạo initials từ tên user (VD: John Doe -> JD)

  return (
    <div className='p-6 rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow'>
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <Avatar className='h-10 w-10 border'>
            <AvatarImage
              src={review.user_avatar || ''}
              alt={review.user_name || ''}
            />
            <AvatarFallback className='bg-muted text-muted-foreground font-medium'>
              {review.user_name}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className='flex items-center gap-2'>
              <span className='font-semibold text-sm text-foreground'>
                {review.user_name || 'Anonymous'}
              </span>
              {review.verified_purchase && (
                <span className='flex items-center text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium border border-emerald-100'>
                  <CheckCircle2 size={10} className='mr-1' />
                  Verified Purchase
                </span>
              )}
            </div>
            <span className='text-xs text-muted-foreground'>
              {formatShortDate(review.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className='mb-3'>
        <div className='flex mb-2'>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={cn(
                'fill-current',
                i < review.rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-200 fill-gray-200'
              )}
            />
          ))}
        </div>
        {review.title && (
          <h4 className='font-bold text-sm text-foreground mb-1'>
            {review.title}
          </h4>
        )}
        <p className='text-sm text-muted-foreground leading-relaxed'>
          {review.content}
        </p>
      </div>

      <div className='flex items-center gap-4 mt-4 pt-4 border-t border-border/40'>
        <span className='text-xs text-muted-foreground'>
          Was this review helpful?
        </span>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='h-6 px-2 text-xs text-muted-foreground hover:text-foreground'
          >
            <ThumbsUp size={12} className='mr-1' /> {review.helpful_count}
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='h-6 px-2 text-xs text-muted-foreground hover:text-foreground'
          >
            <ThumbsDown size={12} className='mr-1' /> 0
          </Button>
        </div>
      </div>
    </div>
  )
}
