import { Skeleton } from '@/shared/components/ui/skeleton'

export function NotificationsGridSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className='rounded-xl border border-border bg-card p-5 space-y-4'
        >
          <Skeleton className='h-5 w-24' />
          <Skeleton className='h-6 w-3/4' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-2/3' />
        </div>
      ))}
    </div>
  )
}
