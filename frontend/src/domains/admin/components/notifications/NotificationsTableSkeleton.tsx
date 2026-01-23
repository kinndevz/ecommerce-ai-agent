import { Skeleton } from '@/shared/components/ui/skeleton'

export function NotificationsTableSkeleton() {
  return (
    <div className='rounded-xl border border-border overflow-hidden bg-card shadow-sm'>
      <div className='bg-muted/50 px-6 py-3'>
        <div className='grid grid-cols-12 gap-4 items-center'>
          <Skeleton className='h-4 col-span-1' />
          <Skeleton className='h-4 col-span-2' />
          <Skeleton className='h-4 col-span-3' />
          <Skeleton className='h-4 col-span-3' />
          <Skeleton className='h-4 col-span-2' />
          <Skeleton className='h-4 col-span-1' />
        </div>
      </div>
      <div className='divide-y'>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className='grid grid-cols-12 gap-4 px-6 py-4 items-center'>
            <Skeleton className='h-6 col-span-1' />
            <Skeleton className='h-6 col-span-2' />
            <Skeleton className='h-6 col-span-3' />
            <Skeleton className='h-6 col-span-3' />
            <Skeleton className='h-6 col-span-2' />
            <Skeleton className='h-6 col-span-1' />
          </div>
        ))}
      </div>
    </div>
  )
}
