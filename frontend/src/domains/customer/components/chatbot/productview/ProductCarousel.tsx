import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import type { ProductData } from '@/api/chat.api'
import { useAddToCart } from '@/hooks/useCarts'
import { toast } from 'sonner'
import { ProductCard } from './ProductCard'

interface ProductCarouselProps {
  products: ProductData[]
  onViewProduct?: (product: ProductData) => void
}

export const ProductCarousel = ({
  products,
  onViewProduct,
}: ProductCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const { mutate: addToCart, isPending } = useAddToCart()

  if (!products || products.length === 0) return null

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5)
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [products])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 300
    const currentScroll = scrollRef.current.scrollLeft

    scrollRef.current.scrollTo({
      left:
        direction === 'left'
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount,
      behavior: 'smooth',
    })
  }

  const handleAddToCart = (product: ProductData) => {
    if (!product.is_available) {
      toast.error('Product is out of stock')
      return
    }

    addToCart({
      product_id: product.id,
      variant_id: null,
      quantity: 1,
    })
  }

  return (
    <div className='relative w-full group/carousel my-4'>
      {showLeftArrow && (
        <Button
          variant='outline'
          size='icon'
          className='absolute left-0 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full shadow-md bg-background/80 backdrop-blur-sm border-border opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 -ml-4 hidden md:flex'
          onClick={() => scroll('left')}
        >
          <ChevronLeft className='h-5 w-5 text-foreground' />
        </Button>
      )}

      {showRightArrow && (
        <Button
          variant='outline'
          size='icon'
          className='absolute right-0 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full shadow-md bg-background/80 backdrop-blur-sm border-border opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 -mr-4 hidden md:flex'
          onClick={() => scroll('right')}
        >
          <ChevronRight className='h-5 w-5 text-foreground' />
        </Button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className='flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-1 snap-x snap-mandatory scroll-smooth'
      >
        {products.map((product) => (
          <div key={product.id} className='flex-none w-50 md:w-55 snap-start'>
            <ProductCard
              product={product}
              isAdding={isPending}
              onView={(p) => onViewProduct?.(p)}
              onAddToCart={handleAddToCart}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
