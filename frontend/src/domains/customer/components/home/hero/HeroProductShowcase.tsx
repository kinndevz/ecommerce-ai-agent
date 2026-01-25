import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'
import type { ProductListItem } from '@/api/product.api'

const FALLBACK_IMAGE = 'https://placehold.co/800x600/png?text=Product'

interface HeroProductShowcaseProps {
  products: ProductListItem[]
  currentSlide: number
  mousePosition: { x: number; y: number }
  onPrevSlide: () => void
  onNextSlide: () => void
  onGoToSlide: (index: number) => void
}

interface ProductCardProps {
  product: ProductListItem
  mousePosition: { x: number; y: number }
}

const MainProductCard = ({ product, mousePosition }: ProductCardProps) => (
  <div
    className='absolute inset-0 flex items-center justify-center'
    style={{
      transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
      transition: 'transform 0.3s ease-out',
    }}
  >
    <Link
      to={`/products/${product.slug || product.id}`}
      className='group relative w-full max-w-sm lg:max-w-md'
    >
      <div className='absolute -inset-4 bg-linear-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500' />

      <div className='relative bg-background/90 backdrop-blur-md rounded-3xl border border-border/50 shadow-2xl overflow-hidden transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-3xl'>
        <div className='relative aspect-4/5 overflow-hidden'>
          <img
            src={product.product_image || FALLBACK_IMAGE}
            alt={product.name}
            className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
          />

          <div className='absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent' />

          <div className='absolute top-4 left-4 flex flex-col gap-2'>
            {product.is_featured && (
              <Badge className='bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg'>
                <Sparkles className='w-3 h-3 mr-1' />
                Featured
              </Badge>
            )}
            {product.sale_price && (
              <Badge className='bg-red-500 text-white border-0 shadow-lg'>
                {Math.round(
                  ((product.price - product.sale_price) / product.price) * 100
                )}
                % OFF
              </Badge>
            )}
          </div>

          <div className='absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
            <Button
              size='sm'
              className='rounded-full bg-white/90 text-foreground hover:bg-white shadow-lg'
            >
              Quick View
            </Button>
          </div>

          <div className='absolute bottom-0 left-0 right-0 p-4 sm:p-6'>
            <div className='space-y-2'>
              {product.brand && (
                <Badge
                  variant='secondary'
                  className='bg-white/20 text-white border-0 backdrop-blur-sm'
                >
                  {product.brand.name}
                </Badge>
              )}
              <h3 className='text-lg sm:text-xl font-bold text-white line-clamp-2'>
                {product.name}
              </h3>
              <div className='flex items-baseline gap-2'>
                <span className='text-xl sm:text-2xl font-bold text-white'>
                  {formatCurrencyVnd(product.sale_price ?? product.price)}
                </span>
                {product.sale_price && (
                  <span className='text-sm text-white/60 line-through'>
                    {formatCurrencyVnd(product.price)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  </div>
)

interface SlideNavigationProps {
  total: number
  currentSlide: number
  onPrevSlide: () => void
  onNextSlide: () => void
  onGoToSlide: (index: number) => void
}

const SlideNavigation = ({
  total,
  currentSlide,
  onPrevSlide,
  onNextSlide,
  onGoToSlide,
}: SlideNavigationProps) => (
  <>
    <div className='absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2'>
      {[...Array(total)].map((_, index) => (
        <button
          key={index}
          onClick={() => onGoToSlide(index)}
          className={cn(
            'transition-all duration-300',
            currentSlide === index
              ? 'w-8 h-2 bg-foreground rounded-full'
              : 'w-2 h-2 bg-foreground/30 rounded-full hover:bg-foreground/50'
          )}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>

    <div className='absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 pointer-events-none'>
      <Button
        size='icon'
        variant='ghost'
        onClick={onPrevSlide}
        className='w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg pointer-events-auto hover:bg-background opacity-0 lg:opacity-100 transition-opacity'
      >
        <ChevronLeft className='w-5 h-5' />
      </Button>
      <Button
        size='icon'
        variant='ghost'
        onClick={onNextSlide}
        className='w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg pointer-events-auto hover:bg-background opacity-0 lg:opacity-100 transition-opacity'
      >
        <ChevronRight className='w-5 h-5' />
      </Button>
    </div>
  </>
)

interface FloatingProductsProps {
  products: ProductListItem[]
  mousePosition: { x: number; y: number }
}

const FloatingProducts = ({ products, mousePosition }: FloatingProductsProps) => (
  <div className='hidden lg:block'>
    {products.slice(0, 2).map((product, index) => (
      <Link
        key={product.id}
        to={`/products/${product.slug || product.id}`}
        className={cn(
          'absolute group',
          index === 0 ? 'top-8 -right-4 xl:right-0' : 'bottom-16 -left-4 xl:left-0'
        )}
        style={{
          transform: `translate(${mousePosition.x * (index === 0 ? -0.2 : 0.2)}px, ${mousePosition.y * (index === 0 ? -0.2 : 0.2)}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        <div className='relative w-24 h-24 xl:w-28 xl:h-28 rounded-2xl overflow-hidden bg-background/90 backdrop-blur-sm border border-border/50 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl'>
          <img
            src={product.product_image || FALLBACK_IMAGE}
            alt={product.name}
            className='w-full h-full object-cover'
          />
          <div className='absolute inset-0 bg-linear-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2'>
            <p className='text-[10px] text-white font-medium line-clamp-2'>
              {product.name}
            </p>
          </div>
        </div>
      </Link>
    ))}
  </div>
)

export const HeroProductShowcase = ({
  products,
  currentSlide,
  mousePosition,
  onPrevSlide,
  onNextSlide,
  onGoToSlide,
}: HeroProductShowcaseProps) => {
  const currentProduct = products[currentSlide]

  return (
    <div className='relative h-[400px] sm:h-[450px] lg:h-[550px] mt-8 lg:mt-0'>
      {currentProduct && (
        <MainProductCard product={currentProduct} mousePosition={mousePosition} />
      )}

      {products.length > 1 && (
        <SlideNavigation
          total={products.length}
          currentSlide={currentSlide}
          onPrevSlide={onPrevSlide}
          onNextSlide={onNextSlide}
          onGoToSlide={onGoToSlide}
        />
      )}

      {products.length > 1 && (
        <FloatingProducts
          products={products.slice(1, 3)}
          mousePosition={mousePosition}
        />
      )}
    </div>
  )
}
