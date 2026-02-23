import { Skeleton } from '@/shared/components/ui/skeleton'

export function ReviewListSkeleton() {
  return (
    <div className='space-y-6'>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className='space-y-3'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-3'>
              <Skeleton className='h-10 w-10 rounded-full' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-3 w-20' />
              </div>
            </div>
            <Skeleton className='h-6 w-12' />
          </div>
          <Skeleton className='h-5 w-3/4' />
          <Skeleton className='h-16 w-full' />
        </div>
      ))}
    </div>
  )
}
