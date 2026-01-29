import { Skeleton } from '@/shared/components/ui/skeleton'

export function RatingSummarySkeleton() {
  return (
    <div className='p-6 border rounded-xl flex gap-8 items-center'>
      <div className='flex flex-col items-center gap-2'>
        <Skeleton className='h-12 w-20' />
        <Skeleton className='h-4 w-32' />
      </div>
      <div className='flex-1 space-y-3'>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className='h-3 w-full' />
        ))}
      </div>
    </div>
  )
}
