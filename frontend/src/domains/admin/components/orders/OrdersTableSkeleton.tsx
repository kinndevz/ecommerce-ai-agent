import { Skeleton } from '@/shared/components/ui/skeleton'

export function OrdersTableSkeleton() {
  return (
    <div className='space-y-4'>
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className='h-20 w-full rounded-xl' />
      ))}
    </div>
  )
}
