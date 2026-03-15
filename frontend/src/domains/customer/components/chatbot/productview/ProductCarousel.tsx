import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import type { ProductData } from '@/api/chat.api'
import { useAddToCart } from '@/hooks/useCarts'
import { toast } from 'sonner'
import { ProductCard } from './ProductCard'
import { useChatLayout } from '@/context/ChatLayoutContext'
import { cn } from '@/lib/utils'

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

  // Lấy layout hiện tại
  const layout = useChatLayout()
  const isCompact = layout === 'compact'

  // Responsive classes
  const cardWidthClass = isCompact ? 'w-36 md:w-40' : 'w-48 sm:w-56'
  const carouselGapClass = isCompact ? 'gap-2.5' : 'gap-4'

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
    const scrollAmount = isCompact ? 200 : 300
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
          className={cn(
            'absolute top-1/2 -translate-y-1/2 z-20 rounded-full shadow-md bg-background/90 backdrop-blur-sm border-border transition-all duration-300 flex',
            isCompact
              ? 'left-1 h-7 w-7 opacity-80 hover:opacity-100'
              : 'left-0 h-9 w-9 -ml-4 opacity-0 group-hover/carousel:opacity-100'
          )}
          onClick={() => scroll('left')}
        >
          <ChevronLeft className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
        </Button>
      )}

      {showRightArrow && (
        <Button
          variant='outline'
          size='icon'
          className={cn(
            'absolute top-1/2 -translate-y-1/2 z-20 rounded-full shadow-md bg-background/90 backdrop-blur-sm border-border transition-all duration-300 flex',
            isCompact
              ? 'right-1 h-7 w-7 opacity-80 hover:opacity-100'
              : 'right-0 h-9 w-9 -mr-4 opacity-0 group-hover/carousel:opacity-100'
          )}
          onClick={() => scroll('right')}
        >
          <ChevronRight className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
        </Button>
      )}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={cn(
          'flex overflow-x-auto scrollbar-hide pb-4 px-1 snap-x snap-mandatory scroll-smooth',
          carouselGapClass
        )}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className={cn('flex-none snap-start', cardWidthClass)}
          >
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
