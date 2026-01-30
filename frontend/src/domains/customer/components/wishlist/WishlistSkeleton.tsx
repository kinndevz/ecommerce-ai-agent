import { Skeleton } from '@/shared/components/ui/skeleton'

export function WishlistSkeleton() {
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className='space-y-4'>
          <Skeleton className='aspect-4/5 w-full rounded-xl' />
          <div className='space-y-2 p-2'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-5 w-1/3' />
            <Skeleton className='h-10 w-full mt-2' />
          </div>
        </div>
      ))}
    </div>
  )
}
