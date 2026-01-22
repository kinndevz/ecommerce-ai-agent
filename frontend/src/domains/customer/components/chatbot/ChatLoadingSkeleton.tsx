import { Skeleton } from '@/shared/components/ui/skeleton'

export const ChatLoadingSkeleton = () => {
  return (
    <div className='flex flex-col gap-8 p-4 w-full max-w-3xl mx-auto'>
      {/* 1. Simulate AI Greeting */}
      <div className='flex flex-col gap-2 animate-pulse'>
        {/* Header: Avatar + Name */}
        <div className='flex items-center gap-3'>
          <Skeleton className='h-8 w-8 rounded-full shrink-0' />
          <Skeleton className='h-4 w-24 rounded' />
        </div>

        {/* Body: Text Lines */}
        <div className='pl-11 space-y-2 w-full'>
          <Skeleton className='h-4 w-[80%]' />
          <Skeleton className='h-4 w-[60%]' />
        </div>
      </div>

      {/* 2. Simulate User Question */}
      <div className='flex flex-col gap-2 animate-pulse'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-8 w-8 rounded-full shrink-0' />
          <Skeleton className='h-4 w-16 rounded' />
        </div>

        <div className='pl-11 w-full'>
          {/* User Bubble style */}
          <Skeleton className='h-12 w-[70%] rounded-2xl rounded-tl-sm' />
        </div>
      </div>

      {/* 3. Simulate AI Response with Product Cards */}
      <div className='flex flex-col gap-2 animate-pulse'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-8 w-8 rounded-full shrink-0' />
          <Skeleton className='h-4 w-24 rounded' />
        </div>

        <div className='pl-11 w-full space-y-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-[90%]' />
          </div>

          {/* Simulate Product Carousel */}
          <div className='flex gap-3 overflow-hidden mt-2'>
            <Skeleton className='h-56 w-40 rounded-xl shrink-0' />
            <Skeleton className='h-56 w-40 rounded-xl shrink-0' />
            <Skeleton className='h-56 w-40 rounded-xl shrink-0' />
          </div>

          {/* Footer Actions */}
          <div className='flex gap-2 pt-2'>
            <Skeleton className='h-8 w-8 rounded-md' />
            <Skeleton className='h-8 w-8 rounded-md' />
          </div>
        </div>
      </div>
    </div>
  )
}
