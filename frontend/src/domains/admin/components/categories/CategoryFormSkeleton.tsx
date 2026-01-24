import { Skeleton } from '@/shared/components/ui/skeleton'

export function CategoryFormSkeleton() {
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
            <Skeleton className='h-10 w-24' />
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-8'>
        <Skeleton className='h-96 w-full' />
      </div>
    </div>
  )
}
