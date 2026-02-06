import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import type { ProductImageData } from '@/api/product.api'

interface ProductGalleryProps {
  name: string
  images: ProductImageData[]
  activeIndex: number
  onChange: (index: number) => void
}

export const ProductGallery = ({
  name,
  images,
  activeIndex,
  onChange,
}: ProductGalleryProps) => {
  const hasMultiple = images.length > 1
  const safeIndex = Math.min(Math.max(activeIndex, 0), images.length - 1)
  const currentImage = images[safeIndex]

  if (!images.length) {
    return (
      <div className='relative aspect-4/5 rounded-xl overflow-hidden bg-muted/40 border border-border/60'>
        <div className='w-full h-full flex items-center justify-center text-muted-foreground/40'>
          <ShoppingCart className='w-10 h-10' />
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      <div className='relative'>
        <div className='relative aspect-4/5 rounded-xl overflow-hidden bg-muted/40 border border-border/60'>
          <img
            src={currentImage.image_url}
            alt={name}
            className='w-full h-full object-cover'
          />
        </div>
        {hasMultiple && (
          <>
            <Button
              type='button'
              variant='secondary'
              size='icon'
              className='absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-muted/90 shadow-md hover:bg-background'
              onClick={() =>
                onChange((safeIndex - 1 + images.length) % images.length)
              }
            >
              <ChevronLeft className='w-4 h-4 text-muted-foreground' />
            </Button>
            <Button
              type='button'
              variant='secondary'
              size='icon'
              className='absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-muted/90 shadow-md hover:bg-background'
              onClick={() => onChange((safeIndex + 1) % images.length)}
            >
              <ChevronRight className='w-4 h-4 text-muted-foreground' />
            </Button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide'>
          {images.map((image, index) => (
            <button
              key={image.id || image.image_url}
              type='button'
              className={`h-14 w-12 rounded-md overflow-hidden border transition-all ${
                index === safeIndex
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border/60 hover:border-primary/60'
              }`}
              onClick={() => onChange(index)}
            >
              <img
                src={image.image_url}
                alt={image.alt_text || name}
                className='h-full w-full object-cover'
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
