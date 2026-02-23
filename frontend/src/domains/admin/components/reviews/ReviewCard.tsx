import { Star } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import type { Review } from '@/api/types/review.types'

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const timeAgo = formatDistanceToNow(new Date(review.created_at), {
    addSuffix: true,
  })

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4 mb-3'>
        <div className='flex items-center gap-3'>
          <Avatar className='h-10 w-10 border'>
            <AvatarFallback className='bg-linear-to-br from-blue-400 to-purple-400 text-white text-sm font-semibold'>
              {review.user_name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className='font-semibold text-sm'>
              {review.user_name || 'Anonymous'}
            </p>
            <div className='flex items-center gap-2 mt-0.5'>
              <div className='flex items-center gap-1 bg-orange-100 dark:bg-orange-950 px-1.5 py-0.5 rounded'>
                <Star className='h-3 w-3 fill-orange-500 text-orange-500' />
                <span className='text-xs font-semibold'>{review.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time */}
        <p className='text-xs text-muted-foreground shrink-0'>{timeAgo}</p>
      </div>

      {/* Title */}
      {review.title && (
        <h4 className='font-semibold text-base mb-2'>{review.title}</h4>
      )}

      {/* Content */}
      <p className='text-sm text-muted-foreground leading-relaxed'>
        {review.content}
      </p>
    </div>
  )
}
