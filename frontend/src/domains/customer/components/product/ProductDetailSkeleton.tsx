import { Skeleton } from '@/shared/components/ui/skeleton'

export function ProductDetailSkeleton() {
  return (
    <div className='container mx-auto px-4 py-8 md:py-16'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16'>
        {/* Gallery Skeleton */}
        <div className='flex gap-4'>
          <div className='hidden md:flex flex-col gap-4 w-24 shrink-0'>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className='w-full aspect-3/4 rounded-md' />
            ))}
          </div>
          <Skeleton className='flex-1 aspect-3/4 md:aspect-auto h-125 rounded-lg' />
        </div>

        {/* Info Skeleton */}
        <div className='space-y-6'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-10 w-3/4' />
          </div>
          <Skeleton className='h-5 w-32' /> {/* Rating */}
          <Skeleton className='h-8 w-40' /> {/* Price */}
          <Skeleton className='h-24 w-full' /> {/* Description */}
          <div className='space-y-3'>
            <Skeleton className='h-5 w-16' />
            <div className='flex gap-3'>
              {[1, 2].map((i) => (
                <Skeleton key={i} className='h-10 w-24' />
              ))}
            </div>
          </div>
          <div className='flex gap-4 pt-6'>
            <Skeleton className='h-12 w-32' />
            <Skeleton className='h-12 flex-1' />
            <Skeleton className='h-12 w-12 rounded-full' />
          </div>
          <div className='grid grid-cols-4 gap-4 pt-6'>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className='h-12 w-full' />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
