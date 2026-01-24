import { Skeleton } from '@/shared/components/ui/skeleton'

export function ProductFormSkeleton() {
  return (
    <div className='space-y-6 p-6'>
      <Skeleton className='h-24 w-full' />
      <div className='grid grid-cols-12 gap-6'>
        <div className='col-span-8 space-y-6'>
          <Skeleton className='h-96 w-full' />
          <Skeleton className='h-64 w-full' />
        </div>
        <div className='col-span-4 space-y-6'>
          <Skeleton className='h-32 w-full' />
          <Skeleton className='h-48 w-full' />
        </div>
      </div>
    </div>
  )
}
