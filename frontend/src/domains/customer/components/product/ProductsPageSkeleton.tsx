import { Skeleton } from '@/shared/components/ui/skeleton'

export function ProductsPageSkeleton() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <div key={i} className='space-y-3'>
          <Skeleton className='aspect-square rounded-2xl' />
          <Skeleton className='h-5 w-3/4' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-2/3' />
          <div className='flex justify-between items-center'>
            <Skeleton className='h-6 w-24' />
            <Skeleton className='h-9 w-28' />
          </div>
        </div>
      ))}
    </div>
  )
}
