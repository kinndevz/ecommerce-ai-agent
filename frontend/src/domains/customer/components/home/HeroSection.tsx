import { useState, useEffect, useCallback } from 'react'
import { useFeaturedProducts } from '@/hooks/useProducts'
import {
  HeroBackground,
  HeroContent,
  HeroProductShowcase,
  HeroFeaturesBar,
} from './hero'

const useAutoSlide = (length: number, interval = 5000) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying || length === 0) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % length)
    }, interval)

    return () => clearInterval(timer)
  }, [isAutoPlaying, length, interval])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [])

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % length)
  }, [currentSlide, length, goToSlide])

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + length) % length)
  }, [currentSlide, length, goToSlide])

  return { currentSlide, goToSlide, nextSlide, prevSlide }
}

const useParallax = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30
      const y = (e.clientY / window.innerHeight - 0.5) * 30
      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return mousePosition
}

export const HeroSection = () => {
  const { data } = useFeaturedProducts(4)
  const products = data?.data ?? []

  const { currentSlide, goToSlide, nextSlide, prevSlide } = useAutoSlide(products.length)
  const mousePosition = useParallax()

  return (
    <section className='relative min-h-[85vh] lg:min-h-[90vh] overflow-hidden'>
      <HeroBackground currentSlide={currentSlide} mousePosition={mousePosition} />

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 lg:pt-16 lg:pb-24'>
        <div className='grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh]'>
          <HeroContent />

          <HeroProductShowcase
            products={products}
            currentSlide={currentSlide}
            mousePosition={mousePosition}
            onPrevSlide={prevSlide}
            onNextSlide={nextSlide}
            onGoToSlide={goToSlide}
          />
        </div>

        <HeroFeaturesBar />
      </div>
    </section>
  )
}
