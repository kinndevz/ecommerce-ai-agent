import { useCallback } from 'react'
import { useRelatedProducts } from '@/hooks/useProducts'
import { ProductCard, type ProductCardData } from './ProductCard'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/components/ui/carousel'
import type { ProductListItem } from '@/api/product.api'

const RELATED_LIMIT = 8
const FALLBACK_IMAGE =
  'https://placehold.co/400x400/f8f8f8/e4e4e7?text=No+Image'

function normalizeProductData(item: ProductListItem | any): ProductCardData {
  let imageUrl = FALLBACK_IMAGE

  if (item.product_image) {
    imageUrl = item.product_image
  } else if (Array.isArray(item.images) && item.images.length > 0) {
    const primaryImg = item.images.find((img: any) => img.is_primary)
    imageUrl = primaryImg?.image_url || item.images[0].image_url
  }

  const hasSale = !!item.sale_price && item.sale_price < item.price

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    brand: item.brand?.name || '',
    description: item.short_description || '',
    price: hasSale ? item.sale_price : item.price,
    originalPrice: hasSale ? item.price : undefined,
    image: imageUrl,
    rating: item.rating_average,
    reviews: item.review_count,
    isSale: hasSale,
  }
}

function RelatedProductsSkeleton() {
  return (
    <div className='space-y-6 py-12 border-t border-border/40'>
      <Skeleton className='h-8 w-48' />
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='space-y-3'>
            <Skeleton className='aspect-square w-full rounded-2xl' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-4 w-1/2' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface RelatedProductsProps {
  productId: string
}

export function RelatedProducts({ productId }: RelatedProductsProps) {
  const { data: response, isLoading } = useRelatedProducts(
    productId,
    RELATED_LIMIT
  )

  const handleScrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  if (isLoading) return <RelatedProductsSkeleton />
  if (!response?.data || response.data.length === 0) return null

  return (
    <section className='py-16 border-t border-border/40'>
      <div className='container px-0 md:px-4'>
        <div className='flex items-center justify-between mb-8 px-4 md:px-0'>
          <h2 className='text-2xl md:text-3xl font-serif text-foreground'>
            You May Also Like
          </h2>
        </div>

        <Carousel
          opts={{ align: 'start', loop: true }}
          className='w-full relative group/carousel'
        >
          <CarouselContent className='-ml-4 pb-4'>
            {response.data.map((product) => (
              <CarouselItem
                key={product.id}
                className='pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4'
              >
                <div onClickCapture={handleScrollTop}>
                  <ProductCard product={normalizeProductData(product)} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className='hidden md:block'>
            <CarouselPrevious className='left-0 -translate-x-1/2 h-10 w-10 border-border bg-background/80 backdrop-blur opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0' />
            <CarouselNext className='right-0 translate-x-1/2 h-10 w-10 border-border bg-background/80 backdrop-blur opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0' />
          </div>
        </Carousel>
      </div>
    </section>
  )
}
