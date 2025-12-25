import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/lib/utils'
import { mockHeroBanners } from '../data/mockData'

export const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const banners = mockHeroBanners

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [banners.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <section className='relative h-125 md:h-150 overflow-hidden rounded-2xl'>
      {/* Slides */}
      <div className='relative h-full'>
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={cn(
              'absolute inset-0 transition-all duration-700 ease-in-out',
              index === currentSlide
                ? 'opacity-100 translate-x-0'
                : index < currentSlide
                ? 'opacity-0 -translate-x-full'
                : 'opacity-0 translate-x-full'
            )}
          >
            {/* Background Image */}
            <div className='absolute inset-0'>
              <img
                src={banner.image}
                alt={banner.title}
                className='w-full h-full object-cover'
              />
              <div className='absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent' />
            </div>

            {/* Content */}
            <div className='relative h-full max-w-7xl mx-auto px-6 flex items-center'>
              <div className='max-w-2xl space-y-6 text-white'>
                <p className='text-sm md:text-base font-semibold uppercase tracking-wider text-primary'>
                  {banner.subtitle}
                </p>
                <h1 className='text-4xl md:text-6xl font-serif font-bold leading-tight'>
                  {banner.title}
                </h1>
                <p className='text-lg md:text-xl text-gray-200'>
                  {banner.description}
                </p>
                <Button
                  size='lg'
                  className='bg-primary hover:bg-primary/90 text-white group'
                >
                  {banner.cta}
                  <ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform' />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className='absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors'
        aria-label='Previous slide'
      >
        <ChevronLeft className='w-6 h-6' />
      </button>
      <button
        onClick={nextSlide}
        className='absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors'
        aria-label='Next slide'
      >
        <ChevronRight className='w-6 h-6' />
      </button>

      {/* Dots Indicator */}
      <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2'>
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
