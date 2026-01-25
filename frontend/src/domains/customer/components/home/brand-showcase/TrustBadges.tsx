import { Verified, Award } from 'lucide-react'

export const TrustBadges = () => (
  <div className='mt-12 lg:mt-16 flex flex-wrap justify-center items-center gap-6 lg:gap-12'>
    <div className='flex items-center gap-2 text-muted-foreground'>
      <Verified className='w-5 h-5 text-blue-500' />
      <span className='text-sm font-medium'>100% Authentic Products</span>
    </div>
    <div className='hidden sm:block w-px h-6 bg-border' />
    <div className='flex items-center gap-2 text-muted-foreground'>
      <Award className='w-5 h-5 text-amber-500' />
      <span className='text-sm font-medium'>Authorized Retailer</span>
    </div>
    <div className='hidden sm:block w-px h-6 bg-border' />
    <div className='flex items-center gap-2 text-muted-foreground'>
      <svg
        className='w-5 h-5 text-emerald-500'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
        />
      </svg>
      <span className='text-sm font-medium'>Quality Guaranteed</span>
    </div>
  </div>
)
