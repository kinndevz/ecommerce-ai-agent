import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  onRatingChange: (rating: number) => void
}

const RATING_LABELS = {
  5: { emoji: '⭐', text: 'Xuất sắc', color: 'text-yellow-600' },
  4: { emoji: '😊', text: 'Rất tốt', color: 'text-green-600' },
  3: { emoji: '👍', text: 'Tốt', color: 'text-blue-600' },
  2: { emoji: '😐', text: 'Trung bình', color: 'text-orange-600' },
  1: { emoji: '😞', text: 'Tệ', color: 'text-red-600' },
} as const

export function RatingStars({ rating, onRatingChange }: RatingStarsProps) {
  const currentRating = RATING_LABELS[rating as keyof typeof RATING_LABELS]

  return (
    <div className='space-y-4'>
      {/* Stars */}
      <div className='flex items-center justify-center gap-2'>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type='button'
            onClick={() => onRatingChange(star)}
            className='group relative transition-transform hover:scale-110 active:scale-95'
          >
            <Star
              className={cn(
                'h-12 w-12 transition-all duration-300',
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]'
                  : 'fill-none text-muted-foreground/30 hover:text-yellow-400/50'
              )}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>

      {/* Rating Label */}
      {currentRating && (
        <div className='animate-in fade-in slide-in-from-top-2 duration-500'>
          <div className='inline-flex items-center gap-2 px-6 py-3 rounded-full bg-linear-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20'>
            <span className='text-3xl'>{currentRating.emoji}</span>
            <div className='flex flex-col'>
              <span className={cn('text-lg font-bold', currentRating.color)}>
                {currentRating.text}
              </span>
              <span className='text-xs text-muted-foreground'>
                {rating} / 5 sao
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
