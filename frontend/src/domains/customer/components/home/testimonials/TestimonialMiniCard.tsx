import { Star } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Testimonial } from './testimonials.data'

interface TestimonialMiniCardProps {
  testimonial: Testimonial
  isActive: boolean
  onClick: () => void
}

export const TestimonialMiniCard = ({
  testimonial,
  isActive,
  onClick,
}: TestimonialMiniCardProps) => (
  <button
    onClick={onClick}
    className={cn(
      'p-4 rounded-xl border text-left transition-all duration-300',
      isActive
        ? 'bg-primary/10 border-primary/30 shadow-md'
        : 'bg-background/50 border-border/50 hover:bg-muted/50'
    )}
  >
    <div className='flex items-center gap-3 mb-2'>
      <Avatar className='w-8 h-8'>
        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
        <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
      </Avatar>
      <div>
        <p className='text-sm font-medium truncate'>{testimonial.name}</p>
        <div className='flex gap-0.5'>
          {[...Array(5)].map((_, i) => (
            <Star key={i} className='w-2.5 h-2.5 text-amber-400 fill-amber-400' />
          ))}
        </div>
      </div>
    </div>
    <p className='text-xs text-muted-foreground line-clamp-2'>
      "{testimonial.content.slice(0, 60)}..."
    </p>
  </button>
)
