import { Star } from 'lucide-react'

export const StatsBar = () => (
  <div className='flex flex-wrap justify-center gap-8 lg:gap-16 mb-12 lg:mb-16'>
    <div className='text-center'>
      <p className='text-3xl lg:text-4xl font-bold text-foreground'>50K+</p>
      <p className='text-sm text-muted-foreground'>Happy Customers</p>
    </div>
    <div className='text-center'>
      <div className='flex items-center justify-center gap-1 mb-1'>
        <span className='text-3xl lg:text-4xl font-bold text-foreground'>4.9</span>
        <Star className='w-6 h-6 text-amber-400 fill-amber-400' />
      </div>
      <p className='text-sm text-muted-foreground'>Average Rating</p>
    </div>
    <div className='text-center'>
      <p className='text-3xl lg:text-4xl font-bold text-foreground'>98%</p>
      <p className='text-sm text-muted-foreground'>Would Recommend</p>
    </div>
  </div>
)
