import { Skeleton } from '@/shared/components/ui/skeleton'
import { Card } from '@/shared/components/ui/card'

export function UserFormSkeleton() {
  return (
    <div className='min-h-screen'>
      <div className='sticky top-0 z-20 bg-background border-b'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <Skeleton className='h-4 w-64 mb-3' />
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <Skeleton className='h-8 w-48' />
              <Skeleton className='h-4 w-72' />
            </div>
            <div className='flex gap-2'>
              <Skeleton className='h-10 w-24' />
              <Skeleton className='h-10 w-32' />
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-8'>
        <Card className='overflow-hidden'>
          <div className='grid grid-cols-1 md:grid-cols-12'>
            <div className='md:col-span-4 border-r p-8'>
              <div className='flex flex-col items-center gap-4'>
                <Skeleton className='w-32 h-32 rounded-full' />
                <Skeleton className='h-5 w-32' />
                <Skeleton className='h-4 w-40' />
              </div>
            </div>
            <div className='md:col-span-8 p-8 space-y-6'>
              <Skeleton className='h-6 w-48' />
              <div className='space-y-4'>
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
