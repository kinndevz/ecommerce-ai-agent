import { useState, useEffect } from 'react'
import { Star, Quote } from 'lucide-react'
import {
  TESTIMONIALS,
  TestimonialCard,
  TestimonialMiniCard,
  StatsBar,
  CarouselNavigation,
} from './testimonials'

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const nextSlide = () => goToSlide((currentIndex + 1) % TESTIMONIALS.length)
  const prevSlide = () =>
    goToSlide((currentIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)

  return (
    <section className='py-16 lg:py-24 bg-linear-to-b from-muted/30 via-muted/50 to-muted/30 relative overflow-hidden'>
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl' />
        <div className='absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl' />
        <Quote className='absolute top-10 left-10 w-32 h-32 text-primary/5 rotate-180' />
        <Quote className='absolute bottom-10 right-10 w-24 h-24 text-primary/5' />
      </div>

      <div className='relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12 lg:mb-16'>
          <div className='inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-4'>
            <Star className='w-3.5 h-3.5 text-primary fill-primary' />
            <span className='text-xs font-semibold text-primary uppercase tracking-wider'>
              Customer Love
            </span>
          </div>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight mb-4'>
            What Our Customers Say
          </h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Join thousands of happy customers who have transformed their skincare
            routine with our premium products
          </p>
        </div>

        <StatsBar />

        <div className='relative'>
          <TestimonialCard testimonial={TESTIMONIALS[currentIndex]} />

          <CarouselNavigation
            total={TESTIMONIALS.length}
            currentIndex={currentIndex}
            onPrev={prevSlide}
            onNext={nextSlide}
            onGoTo={goToSlide}
          />
        </div>

        <div className='hidden lg:grid grid-cols-4 gap-4 mt-8'>
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialMiniCard
              key={testimonial.id}
              testimonial={testimonial}
              isActive={currentIndex === index}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
