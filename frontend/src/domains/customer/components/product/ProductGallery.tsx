import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/shared/components/ui/badge'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { ChevronUp, ChevronDown } from 'lucide-react'
import type { ProductImageData } from '@/api/product.api'

interface ProductGalleryProps {
  images: ProductImageData[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const sortedImages = [...images].sort(
    (a, b) => a.display_order - b.display_order
  )
  const [activeImage, setActiveImage] = useState<string>(
    sortedImages.find((img) => img.is_primary)?.image_url ||
      sortedImages[0]?.image_url
  )

  useEffect(() => {
    if (sortedImages.length > 0) {
      setActiveImage(
        sortedImages.find((img) => img.is_primary)?.image_url ||
          sortedImages[0].image_url
      )
    }
  }, [images])

  return (
    <div className='flex flex-col-reverse md:flex-row gap-4 h-full'>
      <div className='flex flex-col gap-2 items-center'>
        {sortedImages.length > 4 && (
          <ChevronUp className='w-4 h-4 text-muted-foreground hidden md:block' />
        )}

        <ScrollArea className='h-100 w-full md:w-24'>
          <div className='flex md:flex-col gap-4 pb-4 md:pb-0 px-1'>
            {sortedImages.map((img) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(img.image_url)}
                className={cn(
                  'relative aspect-3/4 w-20 md:w-full shrink-0 overflow-hidden rounded-md border-2 transition-all',
                  activeImage === img.image_url
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-transparent hover:border-muted-foreground/25'
                )}
              >
                <img
                  src={img.image_url}
                  alt={img.alt_text || 'Product thumbnail'}
                  className='h-full w-full object-cover'
                />
              </button>
            ))}
          </div>
        </ScrollArea>

        {sortedImages.length > 4 && (
          <ChevronDown className='w-4 h-4 text-muted-foreground hidden md:block' />
        )}
      </div>

      <div className='relative flex-1 aspect-3/4 md:aspect-auto overflow-hidden rounded-lg bg-secondary/20'>
        <img
          src={activeImage}
          alt='Product main'
          className='h-full w-full object-cover object-center'
        />
        <Badge
          variant='secondary'
          className='absolute top-4 left-4 uppercase tracking-wider font-bold'
        >
          Best Seller
        </Badge>
      </div>
    </div>
  )
}
