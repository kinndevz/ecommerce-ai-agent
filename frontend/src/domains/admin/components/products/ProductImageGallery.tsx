import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProductImageData } from '@/api/product.api'

interface ProductImageGalleryProps {
  images: ProductImageData[]
  currentIndex: number
  onSelect: (index: number) => void
  onPrev: () => void
  onNext: () => void
  productName: string
}

export function ProductImageGallery({
  images,
  currentIndex,
  onSelect,
  onPrev,
  onNext,
  productName,
}: ProductImageGalleryProps) {
  return (
    <div className='col-span-12 lg:col-span-5 sticky top-6 z-0'>
      <div className='relative aspect-4/5 bg-background rounded-xl border border-border shadow-sm overflow-hidden group'>
        {images.length > 0 ? (
          <>
            <img
              src={images[currentIndex]?.image_url}
              alt={productName}
              className='w-full h-full object-cover'
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={onPrev}
                  className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity border'
                >
                  <ChevronLeft className='w-5 h-5' />
                </button>
                <button
                  onClick={onNext}
                  className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity border'
                >
                  <ChevronRight className='w-5 h-5' />
                </button>
              </>
            )}
          </>
        ) : (
          <div className='flex items-center justify-center h-full text-muted-foreground'>
            <ImageIcon className='w-16 h-16' />
          </div>
        )}
      </div>

      <div className='grid grid-cols-4 gap-4 mt-4'>
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => onSelect(index)}
            className={cn(
              'aspect-square rounded-lg overflow-hidden border-2 bg-background transition-all',
              index === currentIndex
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-transparent hover:border-border'
            )}
          >
            <img src={image.image_url} alt='thumbnail' className='w-full h-full object-cover' />
          </button>
        ))}
      </div>
    </div>
  )
}
