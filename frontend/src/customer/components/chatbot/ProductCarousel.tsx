import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import type { ProductData } from '@/api/chat.api'
import { useAddToCart } from '@/hooks/useCarts'
import { toast } from 'sonner'

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

                  {/* Stock Badge */}
                  {product.is_available && product.stock_quantity < 10 && (
                    <div className='absolute top-2 left-2'>
                      <Badge
                        variant='outline'
                        className='text-xs bg-background/90 backdrop-blur-sm'
                      >
                        Only {product.stock_quantity} left
                      </Badge>
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  {product.is_available && (
                    <div className='absolute bottom-3 left-3 right-3 translate-y-[120%] group-hover/card:translate-y-0 transition-transform duration-300 ease-out'>
                      <Button
                        variant='secondary'
                        size='sm'
                        className='w-full shadow-sm font-medium h-9 rounded-md border border-border/50 bg-background/90 hover:bg-background text-foreground backdrop-blur-md'
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToCart(product)
                        }}
                        disabled={isPending}
                      >
                        <ShoppingCart className='w-3.5 h-3.5 mr-2' />
                        {isPending ? 'Adding...' : 'Add'}
                      </Button>
                    </div>
                  )}

                  {/* Sold Out Overlay */}
                  {!product.is_available && (
                    <div className='absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-[1px]'>
                      <Badge variant='destructive' className='px-3 py-1'>
                        Sold Out
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className='pt-3 space-y-1.5'>
                  {/* Brand Name */}
                  <div className='text-[10px] uppercase tracking-wider text-muted-foreground font-semibold truncate'>
                    {product.brand_name}
                  </div>

                  {/* Product Name */}
                  <h3 className='text-sm font-medium leading-snug line-clamp-2 min-h-10 text-foreground group-hover/card:text-primary transition-colors'>
                    {product.name}
                  </h3>

                  {/* Category */}
                  <div className='text-xs text-muted-foreground truncate'>
                    {product.category_name}
                  </div>

                  {/* Rating */}
                  <div className='flex items-center gap-1.5'>
                    <div className='flex items-center gap-0.5'>
                      <Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                      <span className='text-xs font-medium'>
                        {product.rating_average.toFixed(1)}
                      </span>
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      • {product.stock_quantity} in stock
                    </span>
                  </div>

                  {/* Price */}
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
