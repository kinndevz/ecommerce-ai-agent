import { Skeleton } from '@/shared/components/ui/skeleton'

export const BrandShowcaseSkeleton = () => (
  <div className='space-y-6'>
    <div className='grid md:grid-cols-2 gap-4 lg:gap-6'>
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className='rounded-2xl lg:rounded-3xl border border-border/50 p-6 lg:p-8'
        >
          <div className='flex items-center gap-5 lg:gap-6'>
            <Skeleton className='w-20 h-20 lg:w-24 lg:h-24 rounded-2xl' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-6 w-32' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-24' />
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className='grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4'>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className='rounded-xl lg:rounded-2xl border border-border/50 p-4 lg:p-5'
        >
          <div className='flex flex-col items-center gap-3'>
            <Skeleton className='w-14 h-14 lg:w-16 lg:h-16 rounded-xl' />
            <Skeleton className='h-4 w-20' />
          </div>
        </div>
      ))}
    </div>
  </div>
)
