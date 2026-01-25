interface ProductSkeletonProps {
  count?: number
}

export const ProductSkeleton = ({ count = 3 }: ProductSkeletonProps) => (
  <>
    {[...Array(count)].map((_, i) => (
      <div key={i} className='space-y-3'>
        <div className='aspect-square bg-muted animate-pulse rounded-2xl' />
        <div className='space-y-2'>
          <div className='h-4 w-3/4 bg-muted animate-pulse rounded' />
          <div className='h-3 w-full bg-muted animate-pulse rounded' />
          <div className='h-3 w-2/3 bg-muted animate-pulse rounded' />
        </div>
        <div className='flex justify-between items-center pt-1'>
          <div className='h-5 w-20 bg-muted animate-pulse rounded' />
          <div className='h-9 w-24 bg-muted animate-pulse rounded-lg' />
        </div>
      </div>
    ))}
  </>
)
