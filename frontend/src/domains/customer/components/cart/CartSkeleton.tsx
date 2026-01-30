import { Skeleton } from '@/shared/components/ui/skeleton'

export function CartSkeleton() {
  return (
    <div className='container mx-auto px-4 py-12'>
      <div className='mb-8 flex items-center justify-between'>
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-10 w-32' />
      </div>
      <div className='grid gap-12 lg:grid-cols-12'>
        <div className='lg:col-span-8 space-y-6'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='flex gap-4'>
              <Skeleton className='h-24 w-24 rounded-xl' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-5 w-3/4' />
                <Skeleton className='h-4 w-1/4' />
              </div>
            </div>
          ))}
        </div>
        <div className='lg:col-span-4'>
          <Skeleton className='h-100 w-full rounded-xl' />
        </div>
      </div>
    </div>
  )
}
