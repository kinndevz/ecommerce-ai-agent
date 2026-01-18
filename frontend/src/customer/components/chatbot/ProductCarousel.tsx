import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import type { ProductData } from '@/api/chat.api'

interface ProductCarouselProps {
  products: ProductData[]
  onAddToCart?: (product: ProductData) => void
  onViewProduct?: (product: ProductData) => void
}

export const ProductCarousel = ({
  products,
  onAddToCart,
  onViewProduct,
}: ProductCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
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
            <Card
              className='h-full border-none shadow-none hover:bg-transparent bg-transparent group/card cursor-pointer'
              onClick={() => onViewProduct?.(product)}
            >
              <CardContent className='p-0'>
                <div className='relative aspect-3/4 rounded-lg overflow-hidden bg-muted/50 border border-border/50'>
                  {product.product_image ? (
                    <img
                      src={product.product_image}
                      alt={product.name}
                      className='w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-muted-foreground/30'>
                      <ShoppingCart className='w-10 h-10' />
                    </div>
                  )}

                  {product.is_available && (
                    <div className='absolute bottom-3 left-3 right-3 translate-y-[120%] group-hover/card:translate-y-0 transition-transform duration-300 ease-out'>
                      <Button
                        variant='secondary'
                        size='sm'
                        className='w-full shadow-sm font-medium h-9 rounded-md border border-border/50 bg-background/90 hover:bg-background text-foreground backdrop-blur-md'
                        onClick={(e) => {
                          e.stopPropagation()
                          onAddToCart?.(product)
                        }}
                      >
                        <ShoppingCart className='w-3.5 h-3.5 mr-2' />
                        Add
                      </Button>
                    </div>
                  )}

                  {!product.is_available && (
                    <div className='absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-[1px]'>
                      <Badge variant='destructive' className='px-3 py-1'>
                        Sold Out
                      </Badge>
                    </div>
                  )}
                </div>

                <div className='pt-3 space-y-1'>
                  <div className='text-[10px] uppercase tracking-wider text-muted-foreground font-semibold truncate'>
                    {product.brand_name}
                  </div>

                  <h3 className='text-sm font-medium leading-snug line-clamp-2 min-h-10 text-foreground group-hover/card:text-primary transition-colors'>
                    {product.name}
                  </h3>

                  <div className='pt-1 flex items-baseline gap-2'>
                    <span className='text-sm font-bold text-foreground'>
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
