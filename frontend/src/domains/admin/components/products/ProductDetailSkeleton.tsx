import { Skeleton } from '@/shared/components/ui/skeleton'

export function ProductDetailSkeleton() {
  return (
    <div className='min-h-screen p-6'>
      <div className='h-10 w-64 bg-muted rounded-md animate-pulse mb-6' />
      <div className='grid grid-cols-12 gap-8 items-start'>
        <div className='col-span-12 lg:col-span-5 space-y-4'>
          <Skeleton className='aspect-4/5 w-full rounded-xl' />
          <div className='grid grid-cols-4 gap-4'>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className='aspect-square rounded-lg' />
            ))}
          </div>
        </div>
        <div className='col-span-12 lg:col-span-7 space-y-6'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className='h-24 rounded-xl' />
            ))}
          </div>
          <Skeleton className='h-96 rounded-xl' />
        </div>
      </div>
    </div>
  )
}
