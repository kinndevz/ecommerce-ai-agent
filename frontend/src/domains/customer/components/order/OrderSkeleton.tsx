import { Skeleton } from '@/shared/components/ui/skeleton'
import { Card } from '@/shared/components/ui/card'

export function OrderGridSkeleton() {
  return (
    <Card className='overflow-hidden'>
      <Skeleton className='aspect-4/3 w-full' />
      <div className='p-4 space-y-3'>
        <div className='flex justify-between'>
          <Skeleton className='h-5 w-24' />
          <Skeleton className='h-4 w-16' />
        </div>
        <Skeleton className='h-4 w-full' />
        <div className='pt-2 flex justify-between items-end'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-7 w-28' />
        </div>
        <Skeleton className='h-9 w-full mt-2' />
      </div>
    </Card>
  )
}

export function OrderListSkeleton() {
  return (
    <Card className='flex flex-col sm:flex-row overflow-hidden h-auto sm:h-40'>
      <Skeleton className='w-full sm:w-48 h-40 shrink-0' />
      <div className='flex-1 p-5 flex flex-col justify-between'>
        <div className='flex justify-between'>
          <div className='space-y-2'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-24' />
          </div>
          <Skeleton className='h-8 w-24' />
        </div>
        <div className='flex justify-between items-end border-t pt-4'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-9 w-24' />
        </div>
      </div>
    </Card>
  )
}

export function OrderDetailSkeleton() {
  return (
    <div className='container max-w-6xl px-4 py-8 space-y-6'>
      <div className='flex justify-between'>
        <Skeleton className='h-8 w-32' />
        <Skeleton className='h-8 w-24' />
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-5 w-64' />
      </div>
      <div className='grid lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-6'>
          <Skeleton className='h-64 w-full rounded-xl' />
          <Skeleton className='h-32 w-full rounded-xl' />
          <div className='grid grid-cols-2 gap-6'>
            <Skeleton className='h-32 w-full' />
            <Skeleton className='h-32 w-full' />
          </div>
        </div>
        <div className='lg:col-span-4'>
          <Skeleton className='h-64 w-full rounded-xl' />
        </div>
      </div>
    </div>
  )
}
