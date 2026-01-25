import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/lib/utils'

interface CarouselNavigationProps {
  total: number
  currentIndex: number
  onPrev: () => void
  onNext: () => void
  onGoTo: (index: number) => void
}

export const CarouselNavigation = ({
  total,
  currentIndex,
  onPrev,
  onNext,
  onGoTo,
}: CarouselNavigationProps) => (
  <div className='flex items-center justify-between mt-6'>
    {/* Dots */}
    <div className='flex items-center gap-2'>
      {[...Array(total)].map((_, index) => (
        <button
          key={index}
          onClick={() => onGoTo(index)}
          className={cn(
            'transition-all duration-300',
            currentIndex === index
              ? 'w-8 h-2 bg-primary rounded-full'
              : 'w-2 h-2 bg-primary/30 rounded-full hover:bg-primary/50'
          )}
          aria-label={`Go to testimonial ${index + 1}`}
        />
      ))}
    </div>

    {/* Arrows */}
    <div className='flex items-center gap-2'>
      <Button variant='outline' size='icon' onClick={onPrev} className='rounded-full'>
        <ChevronLeft className='w-4 h-4' />
      </Button>
      <Button variant='outline' size='icon' onClick={onNext} className='rounded-full'>
        <ChevronRight className='w-4 h-4' />
      </Button>
    </div>
  </div>
)
