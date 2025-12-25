import { Star, Quote } from 'lucide-react'
import { SectionHeading } from '../shared/SectionHeading'
import { cn } from '@/lib/utils'
import { mockTestimonials } from '../data/mockData'

export const TestimonialsSection = () => {
  return (
    <section className='py-16'>
      <div className='max-w-7xl mx-auto px-6'>
        <SectionHeading
          subtitle='What customers say'
          title='Customer Reviews'
          description='Real feedback from real customers'
          align='center'
          className='mb-12'
        />

        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {mockTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// Testimonial Card Sub-component
interface TestimonialCardProps {
  testimonial: (typeof mockTestimonials)[0]
  index: number
}

const TestimonialCard = ({ testimonial, index }: TestimonialCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div
      className={cn(
        'group relative bg-card border border-border rounded-xl p-6',
        'transition-all duration-300 hover:shadow-lg hover:shadow-primary/10',
        'hover:border-primary/50'
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Quote Icon */}
      <div className='absolute top-4 right-4 opacity-10'>
        <Quote className='w-12 h-12 text-primary' />
      </div>

      {/* Rating */}
      <div className='flex gap-1 mb-4'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'w-4 h-4',
              i < testimonial.rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            )}
          />
        ))}
      </div>

      {/* Comment */}
      <p className='text-sm text-foreground mb-4 line-clamp-4'>
        "{testimonial.comment}"
      </p>

      {/* Product */}
      <p className='text-xs font-semibold text-primary mb-4'>
        Product: {testimonial.product}
      </p>

      {/* Divider */}
      <div className='border-t border-border my-4' />

      {/* Customer Info */}
      <div className='flex items-center gap-3'>
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className='w-10 h-10 rounded-full bg-muted'
        />
        <div className='flex-1'>
          <p className='font-semibold text-sm text-foreground'>
            {testimonial.name}
          </p>
          <p className='text-xs text-muted-foreground'>
            {formatDate(testimonial.date)}
          </p>
        </div>
      </div>
    </div>
  )
}
