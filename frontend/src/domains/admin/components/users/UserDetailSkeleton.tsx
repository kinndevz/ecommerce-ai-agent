import { Skeleton } from '@/shared/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'

export function UserDetailSkeleton() {
  return (
    <div className='min-h-screen p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-6 w-48' />
        <div className='flex gap-2'>
          <Skeleton className='h-9 w-24' />
          <Skeleton className='h-9 w-24' />
        </div>
      </div>

      <div className='rounded-xl border border-border p-8'>
        <div className='flex items-center gap-6'>
          <Skeleton className='h-24 w-24 rounded-full' />
          <div className='flex-1 space-y-3'>
            <Skeleton className='h-6 w-56' />
            <Skeleton className='h-4 w-72' />
            <div className='flex gap-2'>
              <Skeleton className='h-6 w-20' />
              <Skeleton className='h-6 w-20' />
              <Skeleton className='h-6 w-24' />
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className='h-5 w-40' />
            </CardHeader>
            <CardContent className='space-y-4'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
