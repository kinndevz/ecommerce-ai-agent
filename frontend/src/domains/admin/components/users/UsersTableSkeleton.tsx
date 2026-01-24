import { Skeleton } from '@/shared/components/ui/skeleton'

export function UsersTableSkeleton() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 10 }).map((_, index) => (
        <Skeleton key={index} className='h-16 w-full' />
      ))}
    </div>
  )
}
