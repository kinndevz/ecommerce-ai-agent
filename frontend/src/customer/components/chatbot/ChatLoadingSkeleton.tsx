import { Skeleton } from '@/shared/components/ui/skeleton'

export const ChatLoadingSkeleton = () => {
  return (
    <div className='flex flex-col gap-4 p-4 w-full h-full bg-background/50'>
      <div className='flex items-start gap-3 w-full animate-pulse'>
        <Skeleton className='h-8 w-8 rounded-full shrink-0' />

        <div className='flex flex-col gap-2 max-w-[75%]'>
          <Skeleton className='h-10 w-50 rounded-2xl rounded-tl-sm' />
        </div>
      </div>

      <div className='flex items-start gap-3 w-full justify-end animate-pulse'>
        <div className='flex flex-col gap-2 items-end max-w-[75%]'>
          <Skeleton className='h-12 w-45 rounded-2xl rounded-tr-sm' />
        </div>
        <Skeleton className='h-8 w-8 rounded-full shrink-0' />
      </div>

      <div className='flex items-start gap-3 w-full animate-pulse'>
        <Skeleton className='h-8 w-8 rounded-full shrink-0' />
        <div className='space-y-2 max-w-[80%]'>
          <Skeleton className='h-9 w-62.5' />
        </div>
      </div>

      <div className='flex items-start gap-3 w-full justify-end animate-pulse'>
        <div className='flex flex-col gap-2 items-end max-w-[75%]'>
          <Skeleton className='h-8 w-30 rounded-2xl rounded-tr-sm' />
        </div>
        <Skeleton className='h-8 w-8 rounded-full shrink-0' />
      </div>
    </div>
  )
}
