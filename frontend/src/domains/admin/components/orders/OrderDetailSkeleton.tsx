import { Skeleton } from '@/shared/components/ui/skeleton'

export function OrderDetailSkeleton() {
  return (
    <div className='min-h-screen'>
      <div className='sticky top-0 z-20 bg-background border-b'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <Skeleton className='h-4 w-64 mb-3' />
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <Skeleton className='h-8 w-48' />
              <div className='flex gap-2'>
                <Skeleton className='h-6 w-24' />
                <Skeleton className='h-6 w-24' />
                <Skeleton className='h-6 w-32' />
              </div>
            </div>
            <Skeleton className='h-10 w-32' />
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          <div className='lg:col-span-7 space-y-6'>
            <Skeleton className='h-96 w-full' />
            <Skeleton className='h-48 w-full' />
          </div>
          <div className='lg:col-span-5 space-y-6'>
            <Skeleton className='h-32 w-full' />
            <Skeleton className='h-32 w-full' />
            <Skeleton className='h-48 w-full' />
          </div>
        </div>
      </div>
    </div>
  )
}
