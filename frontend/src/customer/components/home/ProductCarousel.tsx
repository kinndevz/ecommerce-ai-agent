import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { SectionHeading } from '../shared/SectionHeading'
import { ProductCard } from '../product/ProductCard'
import { toast } from 'sonner'
import { mockNewArrivals } from '../data/mockData'

export const ProductCarousel = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400
      const newScrollPosition =
        scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount)

      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth',
      })
    }
  }

  const handleAddToCart = (productId: string) => {
    toast.success('Product added to cart!', {
      description: 'Check your cart to proceed to checkout',
    })
    console.log('Add to cart:', productId)
  }

  const handleToggleFavorite = (productId: string) => {
    console.log('Toggle favorite:', productId)
  }

  return (
    <section className='py-16'>
      <div className='max-w-7xl mx-auto px-6'>
        {/* Header */}
        <div className='flex items-end justify-between mb-10'>
          <SectionHeading
            subtitle='Just Arrived'
            title='New Arrivals'
            description='Latest additions to our collection'
          />

          {/* Navigation Buttons - Desktop */}
          <div className='hidden md:flex gap-2'>
            <Button
              variant='outline'
              size='icon'
              onClick={() => scroll('left')}
              className='rounded-full'
            >
              <ChevronLeft className='w-5 h-5' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              onClick={() => scroll('right')}
              className='rounded-full'
            >
              <ChevronRight className='w-5 h-5' />
            </Button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className='relative'>
          <div
            ref={scrollContainerRef}
            className='flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4'
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {mockNewArrivals.map((product) => (
              <div key={product.id} className='flex-none w-45 md:w-70'>
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            ))}
          </div>

          {/* Gradient Overlays - Desktop */}
          <div className='hidden md:block absolute left-0 top-0 bottom-0 w-20 bg-linear-to-r from-background to-transparent pointer-events-none' />
          <div className='hidden md:block absolute right-0 top-0 bottom-0 w-20 bg-linear-to-l from-background to-transparent pointer-events-none' />
        </div>

        {/* Mobile Scroll Indicator */}
        <p className='md:hidden text-center text-sm text-muted-foreground mt-4'>
          ← Swipe to see more →
        </p>
      </div>
    </section>
  )
}
