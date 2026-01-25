import { Star, Quote } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Testimonial } from './testimonials.data'

interface TestimonialCardProps {
  testimonial: Testimonial
}

export const TestimonialCard = ({ testimonial }: TestimonialCardProps) => (
  <div className='relative overflow-hidden rounded-2xl lg:rounded-3xl bg-background/80 backdrop-blur-sm border border-border/50 shadow-xl p-6 sm:p-8 lg:p-12'>
    <div className='absolute top-6 right-6 lg:top-8 lg:right-8'>
      <Quote className='w-12 h-12 lg:w-16 lg:h-16 text-primary/10' />
    </div>

    <div className='grid lg:grid-cols-[1fr_auto] gap-8 items-center'>
      <div className='space-y-6'>
        {/* Rating */}
        <div className='flex items-center gap-1'>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                'w-5 h-5',
                i < testimonial.rating
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-300'
              )}
            />
          ))}
        </div>

        {/* Quote */}
        <blockquote className='text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-foreground/90'>
          "{testimonial.content}"
        </blockquote>

        {/* Product Tag */}
        <div className='inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full'>
          <span className='text-xs font-medium text-primary'>
            Purchased: {testimonial.product}
          </span>
        </div>
      </div>

      {/* Author */}
      <div className='flex lg:flex-col items-center gap-4 lg:text-center'>
        <Avatar className='w-16 h-16 lg:w-20 lg:h-20 border-2 border-primary/20'>
          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
          <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className='font-semibold text-foreground'>{testimonial.name}</h4>
          <p className='text-sm text-muted-foreground'>{testimonial.role}</p>
          <p className='text-xs text-muted-foreground mt-1'>{testimonial.date}</p>
        </div>
      </div>
    </div>
  </div>
)
